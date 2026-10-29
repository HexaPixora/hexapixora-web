import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import type { Person } from "../people-block";

/** Roles in a ruled grid; the lead's card is filled with the signal colour. */
export function RolePeople({ people }: { people: Person[] }) {
  return (
    <ul className="grid gap-px border border-line bg-line md:grid-cols-3">
      {people.map((person, i) => (
        <ClipReveal
          key={i}
          as="li"
          className={`grid min-h-[220px] content-between gap-[18px] p-7 transition-colors duration-[400ms] ${
            person.lead ? "bg-signal text-on-signal" : "bg-page hover:bg-page-raised"
          }`}
        >
          <span data-part="crew-meta" className="mono">
            {person.label}
          </span>
          <div>
            <h3 className="wide mb-2.5 text-title font-medium">{person.title}</h3>
            <p className={`min-h-[3.1em] ${person.lead ? "text-on-signal-dim" : "text-copy-dim"}`}>{person.text}</p>
          </div>
        </ClipReveal>
      ))}
    </ul>
  );
}
