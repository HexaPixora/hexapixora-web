const WIDGET_CSS = "https://assets.calendly.com/assets/external/widget.css";
const WIDGET_JS = "https://assets.calendly.com/assets/external/widget.js";

let loading: Promise<void> | null = null;

/** Lazily load Calendly's widget assets once, then resolve. */
export function loadCalendly(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).Calendly) return Promise.resolve();
  if (loading) return loading;

  loading = new Promise<void>((resolve) => {
    if (!document.querySelector(`link[href="${WIDGET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = WIDGET_CSS;
      document.head.appendChild(link);
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_JS}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      if ((window as any).Calendly) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = WIDGET_JS;
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
  return loading;
}

/** Open a Calendly scheduling popup for the given event-type URL. */
export async function openCalendlyPopup(url: string): Promise<void> {
  if (!url) return;
  await loadCalendly();
  (window as any).Calendly?.initPopupWidget({ url });
}
