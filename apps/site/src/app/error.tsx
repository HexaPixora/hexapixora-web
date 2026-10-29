"use client";

import { useEffect } from "react";
import { PILL_CLASS } from "@hexapixora/theme-hexa-noir/components/safe-link";
import { PillLink } from "@hexapixora/theme-hexa-noir/components/pill-link";
import { StatusScreen } from "@hexapixora/theme-hexa-noir/components/status-screen";

// Unexpected render failures, including a page whose API fetch failed mid-way
// (pages throw ApiUnavailableError instead of returning a cached 404).
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="min-h-screen">
      <StatusScreen
        code="Error"
        title="Something went wrong"
        intro="This page hit a snag while loading. Give it another go."
      >
        <button
          type="button"
          onClick={reset}
          className={`${PILL_CLASS} bg-signal px-5 py-3.5 text-sm text-on-signal hover:bg-copy hover:text-page`}
        >
          Try again <span aria-hidden="true">↻</span>
        </button>
        <PillLink href="/" variant="outline">
          Back to home
        </PillLink>
      </StatusScreen>
    </main>
  );
}
