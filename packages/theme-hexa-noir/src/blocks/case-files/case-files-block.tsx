import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { CASE_FILE_ROWS, caseFilesSchema, type CaseFile } from "@hexapixora/contracts/blocks/case-files";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { CountUp } from "@hexapixora/motion/count-up";
import { RedactBar } from "@hexapixora/motion/redact-bar";
import { ChapterHeading } from "../../components/chapter-heading";
import { SectionFrame } from "../../components/section-frame";

// Bar widths per row. Fixed, so a bar never hints at the hidden text's length.
const REDACT_WIDTHS: Record<(typeof CASE_FILE_ROWS)[number]["key"], string> = {
  client: "140px",
  sector: "80px",
  region: "90px",
  scope: "120px",
  outcome: "150px",
};

function FileRows({ file }: { file: CaseFile }) {
  const rows = CASE_FILE_ROWS.filter((row) => file[row.key] || file[`${row.key}Redacted`]);
  if (rows.length === 0) return null;
  return (
    <dl
      data-part="file-rows"
      className="grid grid-cols-[92px_1fr] gap-x-3 gap-y-2 border-t border-line pt-3.5 text-sm"
    >
      {rows.map((row) => (
        <div key={row.key} className="contents">
          <dt data-part="file-meta" className="pt-0.5 font-mono text-[11px] uppercase tracking-[0.14em]">
            {row.label}
          </dt>
          <dd className="font-semibold">
            {/* Redacted values are never rendered, so they can't leak via the page source. */}
            {file[`${row.key}Redacted`] ? (
              <RedactBar width={REDACT_WIDTHS[row.key]} part="redact" />
            ) : (
              file[row.key]
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function CaseFilesBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(caseFilesSchema, config);
  const headingId = useId();
  if (c.files.length === 0 && c.counters.length === 0) return null;

  return (
    <SectionFrame block="case-files" variant={c.variant} labelledBy={c.heading ? headingId : undefined}>
      <ChapterHeading id={headingId} chapter={c.chapter} heading={c.heading} aside={c.aside} />

      {c.counters.length > 0 ? (
        <dl className="mb-4 grid border border-line md:grid-cols-4">
          {c.counters.map((counter, i) => {
            const numeric = /^\d+$/.test(counter.value.trim());
            return (
              <div
                key={i}
                className="flex flex-col-reverse border-b border-line p-[26px] last:border-0 md:border-b-0 md:border-r"
              >
                <dt className="text-copy-dim">{counter.label}</dt>
                <dd className="font-display text-display-md font-medium leading-none">
                  {numeric ? (
                    <CountUp to={Number(counter.value)} suffix={counter.suffix} />
                  ) : (
                    `${counter.value}${counter.suffix}`
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      ) : null}

      {c.files.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-3">
          {c.files.map((file, i) => (
            <ClipReveal
              key={i}
              as="li"
              part="file"
              className="relative min-h-[340px] overflow-hidden px-[26px] pb-6 pt-[26px]"
            >
              <article className="grid content-start gap-[18px]">
                {file.stamp ? (
                  <span
                    aria-hidden="true"
                    className="absolute right-[18px] top-[26px] rotate-[9deg] border-[2.5px] border-signal px-2.5 py-1.5 font-mono text-[13px] font-medium tracking-[0.22em] text-signal opacity-90"
                  >
                    {file.stamp}
                  </span>
                ) : null}
                <span data-part="file-meta" className="mono">{file.number}</span>
                <h3 className="wide max-w-[14ch] text-[21px] font-bold leading-[1.15]">{file.title}</h3>
                <FileRows file={file} />
              </article>
            </ClipReveal>
          ))}
        </ul>
      ) : null}

      {c.note ? <p className="mt-[22px] text-copy-dim">{c.note}</p> : null}
    </SectionFrame>
  );
}
