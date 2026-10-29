import type { WorkConfig } from "@hexapixora/contracts/blocks/work";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { CountUp } from "@hexapixora/motion/count-up";
import { RedactBar } from "@hexapixora/motion/redact-bar";
import type { WorkItem } from "../work-block";

// The details of a case file. Bar widths are fixed, so a bar never hints at the hidden text's length.
const ROWS = [
  { key: "client", label: "Client", width: "140px" },
  { key: "sector", label: "Sector", width: "80px" },
  { key: "region", label: "Region", width: "90px" },
  { key: "scope", label: "Scope", width: "120px" },
  { key: "outcome", label: "Outcome", width: "150px" },
] as const;

function FileRows({ file }: { file: WorkItem }) {
  const rows = ROWS.filter((row) => file[row.key] || file[`${row.key}Redacted`]);
  if (rows.length === 0) return null;
  return (
    <dl data-part="file-rows" className="grid grid-cols-[92px_1fr] gap-x-3 gap-y-2 border-t border-line pt-3.5 text-sm">
      {rows.map((row) => (
        <div key={row.key} className="contents">
          <dt data-part="file-meta" className="pt-0.5 font-mono text-[11px] uppercase tracking-[0.14em]">
            {row.label}
          </dt>
          <dd className="font-semibold">
            {/* Redacted values are never rendered, so they can't leak via the page source. */}
            {file[`${row.key}Redacted`] ? <RedactBar width={row.width} part="redact" /> : file[row.key]}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** NDA case files with stamps and redaction bars, under a row of counters. */
export function DossierWork({ items, stats }: { items: WorkItem[]; stats: WorkConfig["stats"] }) {
  return (
    <>
      {stats.length > 0 ? (
        <dl className="mb-4 grid border border-line md:grid-cols-4">
          {stats.map((stat, i) => {
            const numeric = /^\d+$/.test(stat.value.trim());
            return (
              <div
                key={i}
                className="flex flex-col-reverse border-b border-line p-[26px] last:border-0 md:border-b-0 md:border-r"
              >
                <dt className="text-copy-dim">{stat.label}</dt>
                <dd className="font-display text-display-md font-medium leading-none">
                  {numeric ? <CountUp to={Number(stat.value)} suffix={stat.suffix} /> : `${stat.value}${stat.suffix}`}
                </dd>
              </div>
            );
          })}
        </dl>
      ) : null}

      {items.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-3">
          {items.map((file, i) => (
            <ClipReveal
              key={i}
              as="li"
              part="file"
              className="relative min-h-[340px] overflow-hidden px-[26px] pb-6 pt-[26px]"
            >
              <article className="grid content-start gap-[18px]">
                {file.label ? (
                  <span
                    aria-hidden="true"
                    className="absolute right-[18px] top-[26px] rotate-[9deg] border-[2.5px] border-signal px-2.5 py-1.5 font-mono text-[13px] font-medium tracking-[0.22em] text-signal opacity-90"
                  >
                    {file.label}
                  </span>
                ) : null}
                <span data-part="file-meta" className="mono">
                  {file.number}
                </span>
                <h3 className="wide max-w-[14ch] text-[21px] font-bold leading-[1.15]">{file.title}</h3>
                <FileRows file={file} />
              </article>
            </ClipReveal>
          ))}
        </ul>
      ) : null}
    </>
  );
}
