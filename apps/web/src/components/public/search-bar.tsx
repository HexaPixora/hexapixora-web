"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import pageIcon from "@/components/icons/page-icon.svg";
import globalIcon from "@/components/icons/global-icon.svg";

type Result = { type: "blog" | "page"; title: string; snippet: string; url: string };

export default function SearchBar({
  open,
  onOpenChange,
  glass = true,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  glass?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search as you type (only while the field is open).
  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        const data = await res.json();
        setResults(Array.isArray(data?.results) ? data.results : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q, open]);

  // Focus the input once the open transition has started.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [open]);

  // Close on click-away / Escape. The expanding field and results panel are
  // absolute descendants of wrapRef, so contains() still covers them.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    onOpenChange(false);
    setQ("");
    setResults([]);
  };
  const toggle = () => (open ? close() : onOpenChange(true));

  const seeAll = () => {
    const term = q.trim();
    if (!term) return;
    close();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const blogs = results.filter((r) => r.type === "blog");
  const pages = results.filter((r) => r.type === "page");
  const hasQuery = q.trim().length >= 2;

  // Same glass treatment as the header pills: transparent + backdrop-blur.
  const glassSurface = glass ? "bg-background/0 backdrop-blur-lg" : "bg-background";

  return (
    // Reserves only the icon's footprint in the header row; everything else is
    // absolutely positioned so opening the search never reflows the header.
    <div ref={wrapRef} className="relative h-9 w-9">
      {/* Expanding field — anchored to the right (the CTA's edge) and grows
          leftward out of the icon until fully open. */}
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 flex items-center h-9 rounded-full overflow-hidden transition-all duration-300 ease-out ${
          open ? `w-[min(68vw,320px)] border pl-4 ${glassSurface}` : "w-9 border border-transparent"
        }`}
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search insights and pages…"
          tabIndex={open ? 0 : -1}
          className={`min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground transition-opacity duration-200 ${
            open ? "opacity-100 delay-100" : "opacity-0"
          }`}
        />
        {loading && open && <Loader2 size={16} className="mr-1 shrink-0 animate-spin text-muted-foreground" />}
        <button
          type="button"
          onClick={toggle}
          aria-label={open ? "Close search" : "Search"}
          aria-expanded={open}
          className="grid h-9 w-9 shrink-0 place-items-center text-muted-foreground"
        >
          {open ? <X size={18} /> : <Search size={18} />}
        </button>
      </div>

      {/* Results — drops below the field with the same glass surface. */}
      <div
        aria-hidden={!open || !hasQuery}
        className={`absolute right-0 top-full mt-4 w-[min(68vw,320px)] origin-top-right rounded-2xl border shadow-xl z-10 ${glassSurface} transition-all duration-200 ease-out ${
          open && hasQuery
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
        }`}
      >
        <div className="max-h-[min(60vh,420px)] overflow-y-auto py-2">
          {results.length === 0 && !loading && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No results for “{q.trim()}”.
            </p>
          )}

          {blogs.length > 0 && <Group title="Insights" iconSrc={pageIcon.src} items={blogs} onNavigate={close} />}
          {pages.length > 0 && <Group title="Pages" iconSrc={globalIcon.src} items={pages} onNavigate={close} />}

          {results.length > 0 && (
            <button
              onClick={seeAll}
              className="mt-1 flex w-full items-center justify-between gap-2 border-t px-4 py-2.5 text-sm font-semibold text-primary transition-colors"
            >
              See all results for “{q.trim()}” <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Group({
  title,
  iconSrc,
  items,
  onNavigate,
}: {
  title: string;
  iconSrc: string;
  items: Result[];
  onNavigate: () => void;
}) {
  return (
    <div className="px-2">
      <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconSrc} alt="" className="h-4 w-4" /> {title}
      </div>
      {items.map((r, i) => (
        <Link
          key={`${r.url}-${i}`}
          href={r.url}
          onClick={onNavigate}
          className="block rounded-lg px-2 py-2 transition-colors"
        >
          <div className="text-sm font-medium line-clamp-1">{r.title}</div>
          {r.snippet && <div className="text-xs text-muted-foreground line-clamp-1">{r.snippet}</div>}
        </Link>
      ))}
    </div>
  );
}
