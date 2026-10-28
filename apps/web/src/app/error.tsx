"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ComicPanelArt } from "@/components/public/comic-panel-art";

// Unexpected render failures, including a page whose API fetch failed mid-way
// (pages throw ApiUnavailableError instead of returning a cached 404).
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0f2e] px-4 py-24">
      <div className="w-full max-w-xl border-[3px] border-[#def0fb] bg-[#1b2587] px-6 py-10 text-center shadow-[6px_6px_0_#ffd23f]">
        <ComicPanelArt className="mx-auto mb-6 h-auto w-full max-w-[280px]" />
        <h1 className="mb-3 text-3xl font-black leading-tight text-[#def0fb] sm:text-4xl">Something smudged the ink</h1>
        <p className="mb-8 text-[#a9b4d8]">This page hit a snag while loading. Give it another go.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="border-2 border-[#def0fb] bg-[#ffd23f] px-5 py-2.5 font-bold text-[#0b0f2e] shadow-[4px_4px_0_#def0fb] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#def0fb]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border-2 border-[#def0fb] px-5 py-2.5 font-bold text-[#def0fb] transition-colors hover:bg-[#def0fb]/10"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
