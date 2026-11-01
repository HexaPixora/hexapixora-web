import { weeklyCounts } from './weekly-counts';

describe('weeklyCounts', () => {
  const now = new Date('2026-11-01T12:00:00Z');
  const daysAgo = (days: number) =>
    new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  it('puts this week last and older weeks before it', () => {
    const counts = weeklyCounts(
      [daysAgo(0), daysAgo(6), daysAgo(7), daysAgo(20)],
      now,
      4,
    );
    expect(counts).toEqual([0, 1, 1, 2]);
  });

  it('ignores dates outside the window and in the future', () => {
    expect(weeklyCounts([daysAgo(28), daysAgo(-1)], now, 4)).toEqual([
      0, 0, 0, 0,
    ]);
  });
});
