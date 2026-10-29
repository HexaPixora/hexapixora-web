import type { Action } from "@hexapixora/contracts/blocks/shared";
import { PillLink } from "./pill-link";

/** A block's buttons: primary ones solid, secondary ones outlined. Empty ones are skipped. */
export function Actions({ actions, className = "" }: { actions: Action[]; className?: string }) {
  const list = actions.filter((action) => action.label.trim() && action.url.trim());
  if (list.length === 0) return null;
  return (
    <div data-part="actions" className={`flex flex-wrap gap-3 ${className}`}>
      {list.map((action, i) => (
        <PillLink key={i} href={action.url} variant={action.style === "secondary" ? "outline" : "solid"}>
          {action.label}
        </PillLink>
      ))}
    </div>
  );
}
