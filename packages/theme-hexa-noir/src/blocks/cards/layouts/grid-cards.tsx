import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { ContentIcon } from "../../../components/content-icon";
import { SafeLink } from "../../../components/safe-link";
import type { CardItem } from "../cards-block";

/** Numbered cards with an icon, text and an optional link covering the card. */
export function GridCards({ items }: { items: CardItem[] }) {
  return (
    <ul className="grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <ClipReveal
          key={i}
          as="li"
          className="group relative flex flex-col gap-4 bg-page p-7 transition-colors duration-[400ms] hover:bg-page-raised"
        >
          <span className="mono text-copy-dim">{String(i + 1).padStart(2, "0")}</span>
          <ContentIcon name={item.icon} className="h-8 w-8 text-signal" />
          <h3 className="wide text-title font-medium">{item.title}</h3>
          {item.text ? <p className="flex-1 text-copy-dim">{item.text}</p> : null}
          {item.url && item.linkText ? (
            <SafeLink
              href={item.url}
              className="mono mt-2 self-start transition-colors duration-300 after:absolute after:inset-0 hover:text-signal"
            >
              {item.linkText} <span aria-hidden="true">→</span>
            </SafeLink>
          ) : null}
        </ClipReveal>
      ))}
    </ul>
  );
}
