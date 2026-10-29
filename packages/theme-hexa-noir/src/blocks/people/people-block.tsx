import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { peopleSchema, type PeopleConfig } from "@hexapixora/contracts/blocks/people";
import { BlockHead, labelledBy } from "../../components/block-head";
import { SectionFrame } from "../../components/section-frame";
import type { BlockProps } from "../../lib/block-props";
import { PhotoPeople } from "./layouts/photo-people";
import { RolePeople } from "./layouts/role-people";

export type Person = PeopleConfig["items"][number];

/** The crew as roles (no faces), or a team with photos. */
export function PeopleBlock({ config }: BlockProps) {
  const c = parseBlockConfig(peopleSchema, config);
  const headingId = useId();
  const people = c.items.filter((person) => person.title || person.image);
  if (people.length === 0) return null;

  return (
    <SectionFrame block="people" variant={c.layout} surface={c.surface} labelledBy={labelledBy(headingId, c)}>
      <BlockHead id={headingId} head={c} />
      {c.layout === "photos" ? <PhotoPeople people={people} /> : <RolePeople people={people} />}
      {c.note ? <p className="mt-[22px] text-copy-dim">{c.note}</p> : null}
    </SectionFrame>
  );
}
