const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Counts per week for the last `weeks` weeks, oldest first; the last entry is
 * the 7 days up to `now`. Dates outside the window are ignored.
 */
export function weeklyCounts(dates: Date[], now: Date, weeks = 12): number[] {
  const counts = new Array<number>(weeks).fill(0);
  for (const date of dates) {
    const age = Math.floor((now.getTime() - date.getTime()) / WEEK_MS);
    if (age >= 0 && age < weeks) counts[weeks - 1 - age] += 1;
  }
  return counts;
}
