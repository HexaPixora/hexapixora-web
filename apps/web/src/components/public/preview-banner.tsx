import { isPreview } from "@/lib/cms-fetch";

/**
 * Fixed banner shown only while Next.js Draft Mode is active, signalling that
 * the page may contain unpublished/scheduled content and offering a way out.
 */
export default async function PreviewBanner({ path = "/" }: { path?: string }) {
  if (!(await isPreview())) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-3 rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950 shadow-lg">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-amber-950 animate-pulse" />
        Preview mode — viewing unpublished content
      </span>
      <a
        href={`/api/preview/disable?path=${encodeURIComponent(path)}`}
        className="rounded-full bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-50 hover:bg-amber-900"
      >
        Exit preview
      </a>
    </div>
  );
}
