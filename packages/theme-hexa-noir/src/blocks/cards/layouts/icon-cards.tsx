import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { ContentIcon } from "../../../components/content-icon";
import type { CardItem } from "../cards-block";

/** A ruled grid of icon, title and text. */
export function IconCards({ items }: { items: CardItem[] }) {
  return (
    <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <ClipReveal
          key={i}
          as="li"
          className="grid content-start gap-4 bg-page p-7 transition-colors duration-[400ms] hover:bg-page-raised"
        >
          <ContentIcon name={item.icon} className="h-7 w-7 text-signal" />
          {item.title ? <h3 className="wide text-title font-medium">{item.title}</h3> : null}
          {item.text ? <p className="text-copy-dim">{item.text}</p> : null}
        </ClipReveal>
      ))}
    </ul>
  );
}
