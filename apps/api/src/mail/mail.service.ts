import { Injectable, Logger } from '@nestjs/common';
import { env } from '../config/env';

interface SendArgs {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export interface LeadEmailData {
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  type?: string | null;
}

/**
 * Transactional email via Resend's REST API.
 *
 * Uses the global `fetch` (Node 18+) rather than the SDK so there's no extra
 * dependency to install. When no API key is configured every send is a logged
 * no-op — callers never need to branch on whether email is set up.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly endpoint = 'https://api.resend.com/emails';

  isConfigured(): boolean {
    return env.mail.resendApiKey.length > 0;
  }

  // Escapes for both element text and (double-quoted) attribute contexts, so
  // interpolated values can't break out of an attribute or inject markup.
  private escape(value: string): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Minimal Liquid-subset substitution so admins can personalise copy with
   * `{{ first_name }}`, `{{ name }}`, `{{ email }}` — with an optional
   * `| default: "there"` fallback. Values are HTML-escaped; unknown tokens
   * resolve to their default (or empty). Not a full Liquid engine.
   */
  private applyTokens(content: string, data: Record<string, string>): string {
    return content.replace(
      /\{\{\s*([\w.]+)\s*(?:\|\s*default:\s*["']([^"']*)["']\s*)?\}\}/g,
      (_m, key: string, def?: string) => {
        const val = data[key];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return this.escape(String(val));
        }
        return def !== undefined ? this.escape(def) : '';
      },
    );
  }

  /** Absolute logo URL, or a text wordmark fallback, for the email header. */
  private headerBrand(siteName: string, logoUrl?: string | null): string {
    if (logoUrl && /^https?:\/\//i.test(logoUrl)) {
      return `<img src="${this.escape(logoUrl)}" alt="${this.escape(siteName)}" height="34" style="display:block;height:34px;width:auto;max-width:180px;border:0;outline:none;" />`;
    }
    return `<span style="font-size:20px;font-weight:800;letter-spacing:-0.02em;color:#ffffff;">${this.escape(siteName)}</span>`;
  }

  /**
   * Brand-matched (dark, glass) email shell used for the newsletter welcome and
   * campaigns. Table-based + inline styles for email-client compatibility.
   */
  private brandedShell(opts: {
    siteName: string;
    logoUrl?: string | null;
    preheader?: string;
    bodyHtml: string;
    footerHtml?: string;
  }): string {
    const { siteName, logoUrl, preheader, bodyHtml, footerHtml } = opts;
    const year = new Date().getFullYear();
    const font =
      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
    return `
<div style="margin:0;padding:0;background:#0a0a0a;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#0a0a0a;">${this.escape(preheader)}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
    <tr><td align="center" style="padding:28px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#101012;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
        <tr><td align="center" style="padding:28px 32px 6px;background:#0c0c0e;border-bottom:1px solid rgba(255,255,255,0.06);">
          ${this.headerBrand(siteName, logoUrl)}
        </td></tr>
        <tr><td style="padding:28px 32px 8px;font-family:${font};color:#d4d7dd;font-size:16px;line-height:1.65;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 32px 30px;font-family:${font};">
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:0 0 16px;" />
          <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.7;text-align:center;">
            ${footerHtml || `You're receiving this because you subscribed to ${this.escape(siteName)}.`}
          </p>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;color:#4b5563;font-family:${font};font-size:11px;">© ${year} ${this.escape(siteName)}</p>
    </td></tr>
  </table>
</div>`;
  }

  /** Brand-blue pill button for dark email bodies. */
  private darkButton(label: string, url: string): string {
    return `<a href="${url}" style="display:inline-block;background:#1074e0;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:10px;font-weight:600;font-size:15px;">${this.escape(label)}</a>`;
  }

  private async send({ to, subject, html, replyTo }: SendArgs): Promise<boolean> {
    if (!this.isConfigured()) {
      this.logger.warn(
        `RESEND_API_KEY not set — skipping email "${subject}". Configure it to enable delivery.`,
      );
      return false;
    }

    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.mail.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.mail.from,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          ...(replyTo ? { reply_to: replyTo } : {}),
        }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        this.logger.error(
          `Resend rejected "${subject}" (${res.status}): ${detail.slice(0, 500)}`,
        );
        return false;
      }
      return true;
    } catch (err) {
      this.logger.error(`Failed to send "${subject}": ${(err as Error).message}`);
      return false;
    }
  }

  // Shared layout for a transactional "click this button" email. `intro` may
  // contain pre-escaped inline HTML; `url` is a trusted internal magic link.
  private actionEmail(opts: {
    heading: string;
    intro: string;
    buttonLabel: string;
    url: string;
    footnote?: string;
  }): string {
    const { heading, intro, buttonLabel, url, footnote } = opts;
    return `
      <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;line-height:1.6;color:#111;">
        <h2 style="margin:0 0 12px;">${this.escape(heading)}</h2>
        <p style="color:#333;margin:0 0 8px;">${intro}</p>
        <p style="margin:24px 0;">
          <a href="${url}" style="display:inline-block;background:#1074e0;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;">${this.escape(buttonLabel)}</a>
        </p>
        <p style="color:#888;font-size:13px;margin:0 0 4px;">Or paste this link into your browser:</p>
        <p style="margin:0 0 16px;"><a href="${url}" style="color:#1074e0;word-break:break-all;font-size:13px;">${url}</a></p>
        ${footnote ? `<p style="color:#999;font-size:12px;">${this.escape(footnote)}</p>` : ''}
      </div>`;
  }

  /** Invite a new team member to set their password and join. */
  async sendInvite(params: {
    to: string;
    name?: string | null;
    url: string;
    siteName: string;
    inviterName?: string | null;
  }): Promise<boolean> {
    const { to, name, url, siteName, inviterName } = params;
    const who = inviterName ? this.escape(inviterName) : `The ${this.escape(siteName)} team`;
    const greeting = name ? ` ${this.escape(name)},` : '';
    return this.send({
      to,
      subject: `Your invitation to ${siteName}`,
      html: this.actionEmail({
        heading: `You've been invited to ${siteName}`,
        intro: `Hi${greeting} ${who} has invited you to join the ${this.escape(siteName)} admin. Click below to accept and set your password.`,
        buttonLabel: 'Accept invite',
        url,
        footnote: 'This invite link expires in 7 days. If you weren’t expecting this, you can ignore this email.',
      }),
    });
  }

  /** Password-reset magic link. */
  async sendPasswordReset(params: {
    to: string;
    name?: string | null;
    url: string;
    siteName: string;
  }): Promise<boolean> {
    const { to, name, url, siteName } = params;
    const first = this.escape((name || '').split(' ')[0] || 'there');
    return this.send({
      to,
      subject: `Reset your ${siteName} password`,
      html: this.actionEmail({
        heading: 'Reset your password',
        intro: `Hi ${first}, we received a request to reset your ${this.escape(siteName)} password. Click below to choose a new one.`,
        buttonLabel: 'Reset password',
        url,
        footnote:
          'This link expires in 1 hour. If you didn’t request this, you can safely ignore this email — your password won’t change.',
      }),
    });
  }

  /** Verify a requested email-address change (sent to the NEW address). */
  async sendEmailChangeVerification(params: {
    to: string;
    name?: string | null;
    url: string;
    siteName: string;
  }): Promise<boolean> {
    const { to, name, url, siteName } = params;
    const first = this.escape((name || '').split(' ')[0] || 'there');
    return this.send({
      to,
      subject: `Confirm your new email for ${siteName}`,
      html: this.actionEmail({
        heading: 'Confirm your new email',
        intro: `Hi ${first}, confirm that you want to use this address for your ${this.escape(siteName)} account by clicking below.`,
        buttonLabel: 'Confirm email',
        url,
        footnote: 'This link expires in 1 hour. If you didn’t request this change, you can ignore this email.',
      }),
    });
  }

  /**
   * Wrap admin-composed campaign HTML in the brand shell, personalising any
   * `{{ first_name }}` / `{{ name }}` / `{{ email }}` tokens for the recipient.
   */
  renderCampaignHtml(opts: {
    content: string;
    unsubscribeUrl: string;
    siteName: string;
    logoUrl?: string | null;
    recipient?: { name?: string | null; email: string };
  }): string {
    const { content, unsubscribeUrl, siteName, logoUrl, recipient } = opts;
    const name = (recipient?.name || '').trim();
    const body = this.applyTokens(content, {
      first_name: name.split(' ')[0] || '',
      name,
      email: recipient?.email || '',
    });
    const footerHtml = `You're receiving this because you subscribed to ${this.escape(siteName)}.<br/>
      <a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>`;
    return this.brandedShell({ siteName, logoUrl, bodyHtml: `<div>${body}</div>`, footerHtml });
  }

  /** Personalised, brand-matched welcome sent the moment someone subscribes. */
  async sendNewsletterWelcome(params: {
    to: string;
    name?: string | null;
    siteName: string;
    logoUrl?: string | null;
    unsubscribeUrl: string;
    exploreUrl: string;
  }): Promise<boolean> {
    const { to, name, siteName, logoUrl, unsubscribeUrl, exploreUrl } = params;
    const first = this.escape((name || '').split(' ')[0] || 'there');
    const bullets = [
      'Thought-provoking insights on design, development, AI and digital innovation',
      'Behind-the-scenes looks at our projects and creative process',
      'Practical tips, resources and tools we genuinely use',
      'Early access to new launches, experiments and announcements',
    ];
    const bodyHtml = `
      <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">
        Welcome to ${this.escape(siteName)}, ${first} 👋
      </h1>
      <p style="margin:0 0 16px;">
        You didn't just subscribe to another newsletter — you joined a community of designers,
        developers, founders and innovators who believe exceptional digital experiences are built with intention.
      </p>
      <p style="margin:0 0 10px;color:#ffffff;font-weight:600;">Here's what to expect:</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
        ${bullets
          .map(
            (b) => `<tr><td style="padding:4px 10px 4px 0;color:#1093fd;vertical-align:top;">●</td>
              <td style="padding:4px 0;color:#d4d7dd;">${this.escape(b)}</td></tr>`,
          )
          .join('')}
      </table>
      <p style="margin:0 0 20px;">
        No spam. No noise. Just carefully crafted content that informs, inspires and helps you build better digital experiences.
      </p>
      <p style="margin:0 0 26px;">${this.darkButton('Explore our work', exploreUrl)}</p>
      <p style="margin:0;color:#9ca3af;">Talk soon,<br/>The ${this.escape(siteName)} Team</p>`;
    const footerHtml = `You subscribed to ${this.escape(siteName)} with this email address.<br/>
      <a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>`;
    return this.send({
      to,
      subject: `Welcome to ${siteName} 👋`,
      html: this.brandedShell({
        siteName,
        logoUrl,
        preheader: 'Thanks for subscribing — here’s what to expect.',
        bodyHtml,
        footerHtml,
      }),
    });
  }

  /**
   * Send many emails via Resend's batch endpoint (≤100 per request). Returns the
   * number accepted. Used for newsletter campaigns; never throws.
   */
  async sendBatch(items: Array<{ to: string; subject: string; html: string }>): Promise<number> {
    if (!this.isConfigured()) {
      this.logger.warn(`RESEND_API_KEY not set — skipping batch of ${items.length} email(s).`);
      return 0;
    }
    let sent = 0;
    for (let i = 0; i < items.length; i += 100) {
      const chunk = items.slice(i, i + 100);
      try {
        const res = await fetch('https://api.resend.com/emails/batch', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.mail.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            chunk.map((e) => ({ from: env.mail.from, to: [e.to], subject: e.subject, html: e.html })),
          ),
        });
        if (res.ok) {
          sent += chunk.length;
        } else {
          const detail = await res.text().catch(() => '');
          this.logger.error(`Resend batch failed (${res.status}): ${detail.slice(0, 300)}`);
        }
      } catch (err) {
        this.logger.error(`Batch send error: ${(err as Error).message}`);
      }
    }
    return sent;
  }

  /** Internal alert to the team that a new lead arrived. */
  async sendLeadNotification(params: {
    lead: LeadEmailData;
    notifyTo: string;
    siteName: string;
  }): Promise<boolean> {
    const { lead, notifyTo, siteName } = params;
    if (!notifyTo) {
      this.logger.warn(
        'No lead-notification recipient (set LEADS_NOTIFY_TO or settings.businessEmail) — skipping internal alert.',
      );
      return false;
    }

    const type = (lead.type || 'contact').toString();
    const rows: Array<[string, string]> = [
      ['Name', lead.name],
      ['Email', lead.email],
      ['Phone', lead.phone || '—'],
      ['Type', type],
      ['Message', lead.message || '—'],
    ];

    const html = `
      <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="margin:0 0 4px;">New ${this.escape(type)} lead</h2>
        <p style="color:#666;margin:0 0 16px;">Submitted on ${siteName}.</p>
        <table style="width:100%;border-collapse:collapse;">
          ${rows
            .map(
              ([k, v]) => `<tr>
                <td style="padding:8px 12px;border:1px solid #eee;background:#fafafa;font-weight:600;width:120px;vertical-align:top;">${k}</td>
                <td style="padding:8px 12px;border:1px solid #eee;white-space:pre-wrap;">${this.escape(v)}</td>
              </tr>`,
            )
            .join('')}
        </table>
        <p style="margin:16px 0 0;">
          <a href="mailto:${this.escape(lead.email)}" style="color:#4f46e5;">Reply to ${this.escape(lead.name)}</a>
        </p>
      </div>`;

    return this.send({
      to: notifyTo,
      subject: `New ${type} lead: ${lead.name}`,
      html,
      replyTo: lead.email,
    });
  }

  /** Auto-acknowledgement to the prospect who submitted the form. */
  async sendLeadAutoResponse(params: {
    lead: LeadEmailData;
    siteName: string;
  }): Promise<boolean> {
    const { lead, siteName } = params;
    const firstName = this.escape((lead.name || '').split(' ')[0] || 'there');

    const html = `
      <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;line-height:1.6;">
        <h2 style="margin:0 0 12px;">Thanks for reaching out, ${firstName}!</h2>
        <p>We've received your message and a member of the ${this.escape(siteName)} team will get back to you shortly — usually within one business day.</p>
        ${
          lead.message
            ? `<p style="color:#666;">For your records, here's what you sent us:</p>
               <blockquote style="margin:0;padding:12px 16px;border-left:3px solid #4f46e5;background:#f6f6ff;white-space:pre-wrap;">${this.escape(lead.message)}</blockquote>`
            : ''
        }
        <p>Talk soon,<br/>The ${this.escape(siteName)} Team</p>
      </div>`;

    return this.send({
      to: lead.email,
      subject: `Thanks for contacting ${siteName}`,
      html,
    });
  }
}
