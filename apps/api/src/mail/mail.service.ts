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

  private escape(value: string): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
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
