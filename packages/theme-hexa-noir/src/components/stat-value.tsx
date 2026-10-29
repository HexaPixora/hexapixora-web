import { CountUp } from "@hexapixora/motion/count-up";

/**
 * A stat like "120+", "98%" or "B2B". Values that start with a whole number
 * count up on first view; anything else is shown as written.
 */
export function StatValue({ value, className }: { value: string; className?: string }) {
  const match = /^(\d+)(\D*)$/.exec(value.trim());
  if (!match) return <span className={className}>{value}</span>;
  return <CountUp to={Number(match[1])} suffix={match[2]} className={className} />;
}
