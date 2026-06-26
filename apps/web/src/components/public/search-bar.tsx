"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, Loader2, Newspaper, FileText, ArrowRight } from "lucide-react";

type Result = { type: "blog" | "page"; title: string; snippet: string; url: string };

export default function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search as you type.
  useEffect(() => {
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
  }, [q]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on click-away / Escape.
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
    setOpen(false);
    setQ("");
    setResults([]);
  };

  const seeAll = () => {
    const term = q.trim();
    if (!term) return;
    close();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const blogs = results.filter((r) => r.type === "blog");
  const pages = results.filter((r) => r.type === "page");
  const showPanel = open && q.trim().length >= 2;

  return (
    <div ref={wrapRef} className="relative">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          aria-label="Search"
          className="p-2 rounded-md text-muted-foreground hover:text-primary transition-colors"
        >
          <Search size={18} />
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            seeAll();
          }}
          className="flex items-center gap-2 rounded-full border bg-background pl-3 pr-2 h-10 w-[min(72vw,320px)] shadow-sm"
        >
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search blogs and pages…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {loading ? (
            <Loader2 size={16} className="animate-spin text-muted-foreground shrink-0" />
          ) : (
            <button type="button" onClick={close} aria-label="Close search" className="text-muted-foreground hover:text-foreground shrink-0">
              <X size={16} />
            </button>
          )}
        </form>
      )}

      {showPanel && (
        <div className="absolute right-0 mt-2 w-[min(90vw,380px)] rounded-xl border bg-background shadow-xl overflow-hidden z-50">
          <div className="max-h-[60vh] overflow-y-auto py-2">
            {results.length === 0 && !loading && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No results for “{q.trim()}”.
              </p>
            )}

            {blogs.length > 0 && <Group title="Blog" icon={<Newspaper size={13} />} items={blogs} onNavigate={close} />}
            {pages.length > 0 && <Group title="Pages" icon={<FileText size={13} />} items={pages} onNavigate={close} />}

            {results.length > 0 && (
              <button
                onClick={seeAll}
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 mt-1 border-t text-sm font-semibold text-primary hover:bg-muted/50 transition-colors"
              >
                See all results for “{q.trim()}” <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Group({
  title,
  icon,
  items,
  onNavigate,
}: {
  title: string;
  icon: React.ReactNode;
  items: Result[];
  onNavigate: () => void;
}) {
  return (
    <div className="px-2">
      <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {title}
      </div>
      {items.map((r, i) => (
        <Link
          key={`${r.url}-${i}`}
          href={r.url}
          onClick={onNavigate}
          className="block rounded-lg px-2 py-2 hover:bg-muted/60 transition-colors"
        >
          <div className="text-sm font-medium line-clamp-1">{r.title}</div>
          {r.snippet && <div className="text-xs text-muted-foreground line-clamp-1">{r.snippet}</div>}
        </Link>
      ))}
    </div>
  );
}
