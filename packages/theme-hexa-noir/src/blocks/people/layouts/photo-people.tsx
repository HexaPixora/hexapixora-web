import { safeHref } from "@hexapixora/contracts/links";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { SafeLink } from "../../../components/safe-link";
import { mediaAlt } from "../../../lib/media-alt";
import type { Person } from "../people-block";
import { MediaImage } from "../../../components/media-image";

/** Portrait cards with a large index number, name, role and a profile link. */
export function PhotoPeople({ people }: { people: Person[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((person, i) => {
        const image = safeHref(person.image);
        return (
          <ClipReveal key={i} as="li" className="lg:[&:nth-child(3n-1)]:mt-16">
            <article>
              <div className="relative aspect-[4/5] overflow-hidden border border-line bg-page-raised">
                {image ? (
                  <MediaImage
                    src={image}
                    alt={mediaAlt(image, person.title)}
                    fill
                    sizes="(min-width: 1440px) 450px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <span aria-hidden="true" className="wide grid h-full place-items-center text-display-lg text-copy/10">
                    {person.title.charAt(0) || "?"}
                  </span>
                )}
                <span aria-hidden="true" className="mono absolute left-4 top-4 text-signal">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="wide mt-5 text-title font-medium">{person.title}</h3>
              {person.label ? <p className="mt-1 text-copy-dim">{person.label}</p> : null}
              {person.url && person.url !== "#" ? (
                <SafeLink href={person.url} className="mono mt-3 inline-block transition-colors hover:text-signal">
                  Profile <span className="sr-only">: {person.title}</span>
                </SafeLink>
              ) : null}
            </article>
          </ClipReveal>
        );
      })}
    </ul>
  );
}
