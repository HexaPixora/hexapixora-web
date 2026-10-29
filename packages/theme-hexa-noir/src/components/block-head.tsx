import { ChapterHeading } from "./chapter-heading";
import { SectionHeading } from "./section-heading";

export type Head = {
  label: string;
  heading: string;
  intro: string;
  number: string;
  aside: string;
  headStyle: "display" | "chapter";
};

/**
 * The shared heading group of every library block: a large display heading,
 * or the cinematic chapter row ("01 / Heading … note"). Either way the
 * heading is the section's <h2>.
 */
export function BlockHead({ id, head }: { id: string; head: Head }) {
  if (head.headStyle === "chapter") {
    return (
      <>
        <ChapterHeading id={id} chapter={head.number} heading={head.heading} aside={head.aside} />
        {head.intro ? <p className="-mt-6 mb-chapter max-w-[56ch] text-lg text-copy-dim">{head.intro}</p> : null}
      </>
    );
  }
  return <SectionHeading id={id} eyebrow={head.label} heading={head.heading} subheading={head.intro} />;
}

/** The id to pass to `aria-labelledby`, only when there is a heading to point at. */
export const labelledBy = (id: string, head: Pick<Head, "heading">) => (head.heading ? id : undefined);
