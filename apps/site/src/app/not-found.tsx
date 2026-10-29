import type { Metadata } from "next";
import { SiteLayout } from "@/components/public/site-layout";
import { PillLink } from "@hexapixora/theme-hexa-noir/components/pill-link";
import { StatusScreen } from "@hexapixora/theme-hexa-noir/components/status-screen";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

// Real 404s only: while the API is down the proxy serves the maintenance page
// instead, and pages throw rather than calling notFound() on a failed fetch.
export default function NotFound() {
  return (
    <SiteLayout showHeader showFooter>
      <StatusScreen
        code="404"
        title="This page isn't here"
        intro="It moved, or it never existed. Head home, or read what we've been writing."
      >
        <PillLink href="/">Back to home</PillLink>
        <PillLink href="/insights" variant="outline">
          Read insights
        </PillLink>
      </StatusScreen>
    </SiteLayout>
  );
}
