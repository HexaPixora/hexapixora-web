import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { SafeLink } from "../../../components/safe-link";
import type { CardItem } from "../cards-block";

/** "Web design | /services/web" lines → a label with an optional link. */
function parseTags(text: string) {
  return text
    .split("\n")
    .map((line) => {
      const [label = "", url = ""] = line.split("|").map((part) => part.trim());
      return { label, url };
    })
    .filter((tag) => tag.label);
}

/** Large rows: a small label, a huge title, then text and a list of services. */
export function PillarCards({ items }: { items: CardItem[] }) {
  return (
    <div>
      {items.map((item, i) => (
        <ClipReveal
          key={i}
          className="grid items-start gap-[30px] border-t border-line py-11 md:grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)]"
        >
          <span className="mono pt-3.5 text-signal">{item.label}</span>
          <h3 className="wide text-display-pillar font-bold">{item.title}</h3>
          <div className="grid gap-4 pt-2.5">
            {item.text ? <p>{item.text}</p> : null}
            <ul data-part="service-list" className="grid gap-1.5 font-semibold">
              {parseTags(item.tags).map((tag, j) => (
                <li key={j}>
                  <SafeLink href={tag.url} keepText className="underline-offset-4 hover:text-signal hover:underline">
                    {tag.label}
                  </SafeLink>
                </li>
              ))}
            </ul>
          </div>
        </ClipReveal>
      ))}
    </div>
  );
}
