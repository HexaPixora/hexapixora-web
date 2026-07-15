# Security Policy

We take the security of HexaPixora and our users' data seriously. Thank you for
helping keep the project and its users safe.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues,
pull requests, or discussions.**

Instead, report them privately using either of the following:

1. **GitHub Private Vulnerability Reporting (preferred)** — open the repository's
   **Security** tab and click **"Report a vulnerability"**, or go directly to
   <https://github.com/HexaPixora/hexapixora-web/security/advisories/new>.
   This creates a private advisory only the maintainers can see.
2. **Email** — send the details to **security@hexapixora.com**.

Please include as much of the following as you can:

- A clear description of the vulnerability and its impact
- Steps to reproduce (proof-of-concept, requests, or screenshots)
- The affected URL, endpoint, or file/component
- Any suggested remediation, if you have one

## What to Expect

- **Acknowledgement:** we aim to confirm we received your report within
  **3 business days**.
- **Assessment:** we'll investigate and keep you updated on our progress and the
  expected timeline.
- **Resolution:** once fixed, we'll let you know and, with your permission,
  credit you for the discovery.

We ask that you give us a reasonable amount of time to resolve the issue before
any public disclosure.

## Scope

**In scope**

- This repository's application code (the Next.js web app and NestJS API)
- Authentication, authorization, data handling and input-validation issues
- Cross-site scripting (XSS), CSRF, SQL/NoSQL injection, SSRF and similar

**Out of scope**

- Vulnerabilities in the third-party platforms we build on (Vercel, Railway,
  Supabase, Resend, Cloudflare) — please report those to the respective vendor
- Denial-of-service (DoS/DDoS), volumetric or brute-force attacks
- Social engineering, phishing, or physical attacks
- Automated-scanner output with no demonstrated, exploitable impact
- Missing security headers or best-practice suggestions with no concrete exploit

## Safe Harbor

We consider security research and vulnerability disclosure carried out in good
faith and in line with this policy to be authorized. We will not pursue legal
action against researchers who:

- Make a good-faith effort to avoid privacy violations, data destruction and
  service disruption
- Only interact with accounts they own or have explicit permission to access
- Do not exploit a discovered issue beyond what is necessary to demonstrate it
- Do not publicly disclose the issue before we've had a chance to remediate it

## Supported Versions

This is a continuously deployed application; the `main` branch reflects what is
live in production and is the only supported version. Fixes are applied to
`main`.

Thank you for helping keep HexaPixora and its users secure.
