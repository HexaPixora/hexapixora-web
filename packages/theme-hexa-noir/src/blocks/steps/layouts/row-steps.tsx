import { DrawLine } from "@hexapixora/motion/draw-line";
import { Highlighted } from "../../../components/highlighted";
import type { StepsLayoutProps } from "../steps-block";

/** Steps in a row on a line that draws itself, with an optional closing line. */
export function RowSteps({ items, note }: StepsLayoutProps) {
  // Three or six steps sit better three across than four.
  const columns = items.length % 3 === 0 && items.length % 4 !== 0 ? "lg:grid-cols-3" : "lg:grid-cols-4";

  return (
    <>
      <div className="relative">
        <span aria-hidden="true" className="absolute inset-x-0 top-2.5 h-px bg-line" />
        <DrawLine className="absolute inset-x-0 top-2.5 block h-0.5 bg-signal shadow-[0_0_14px_var(--color-signal)]" />
        <ol className={`grid gap-12 pt-10 sm:grid-cols-2 md:gap-6 ${columns}`}>
          {items.map((item, i) => (
            <li key={i} data-part="step" className="relative">
              {item.label ? <span className="mono">{item.label}</span> : null}
              {item.title ? <h3 className="wide my-2 text-[22px] font-medium">{item.title}</h3> : null}
              {item.text ? <p className="text-copy-dim">{item.text}</p> : null}
            </li>
          ))}
        </ol>
      </div>
      {note ? (
        <p className="mt-[50px] font-display text-promise font-light">
          <Highlighted text={note} />
        </p>
      ) : null}
    </>
  );
}
