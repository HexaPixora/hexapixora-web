import { useId } from "react";
import Link from "next/link";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { contactFormSchema } from "@hexapixora/contracts/blocks/legacy/contact-form";
import { SectionFrame } from "../../components/section-frame";
import { ContactForm } from "./contact-form";

const EMAIL_PATTERN = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

/**
 * The contact section: heading and direct contact lines on the left, the
 * enquiry form on the right. Email and phone are only linked when they are
 * well-formed, so a stray CMS value can't become an odd `mailto:` or `tel:`.
 */
export function ContactFormBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(contactFormSchema, config);
  const headingId = useId();
  // Read on the server and handed to the form; Turnstile site keys are public.
  const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY;

  const email = EMAIL_PATTERN.test(c.emailAddress.trim()) ? c.emailAddress.trim() : "";
  const phoneDigits = c.phoneNumber.replace(/[^0-9+]/g, "");
  const phone = phoneDigits.length >= 6 ? c.phoneNumber.trim() : "";

  return (
    <SectionFrame block="contact-form" labelledBy={c.title ? headingId : undefined}>
      <div className="grid gap-16 lg:grid-cols-[1fr_1.25fr]">
        <div className="grid content-start gap-12">
          <div>
            {c.title ? (
              <h2 id={headingId} className="wide max-w-[16ch] text-display-md font-medium">
                {c.title}
              </h2>
            ) : null}
            {c.subtitle ? <p className="mt-5 max-w-[48ch] text-lg text-copy-dim">{c.subtitle}</p> : null}
          </div>

          {email || phone ? (
            <dl data-part="contact-lines" className="grid gap-6">
              {email ? (
                <div>
                  <dt className="mono text-copy-dim">Email</dt>
                  <dd className="wide mt-1.5 text-title font-medium">
                    <a href={`mailto:${email}`} className="break-all transition-colors hover:text-signal">
                      {email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {phone ? (
                <div>
                  <dt className="mono text-copy-dim">Phone</dt>
                  <dd className="wide mt-1.5 text-title font-medium">
                    <a href={`tel:${phoneDigits}`} className="transition-colors hover:text-signal">
                      {phone}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          <p className="max-w-[48ch] text-sm text-copy-dim">
            By sending this form you agree to our{" "}
            <Link href="/privacy-policy" className="text-copy underline underline-offset-4 hover:text-signal">
              Privacy Policy
            </Link>
            . We only use your details to reply to your enquiry.
          </p>
        </div>

        <ContactForm turnstileSiteKey={turnstileSiteKey} />
      </div>
    </SectionFrame>
  );
}
