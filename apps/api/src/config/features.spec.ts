import { FEATURE_KEYS, parseFeatures } from './features';

const allOn = Object.fromEntries(FEATURE_KEYS.map((key) => [key, true]));
const allOff = Object.fromEntries(FEATURE_KEYS.map((key) => [key, false]));

describe('parseFeatures', () => {
  it('keeps every feature on when FEATURES is unset or empty', () => {
    expect(parseFeatures(undefined)).toEqual({ features: allOn, unknown: [] });
    expect(parseFeatures('  ')).toEqual({ features: allOn, unknown: [] });
  });

  it('switches everything off with "none"', () => {
    expect(parseFeatures('none')).toEqual({ features: allOff, unknown: [] });
  });

  it('keeps only the listed features, ignoring case and spaces', () => {
    const { features, unknown } = parseFeatures(' Leads , themes ');
    expect(features).toEqual({ ...allOff, leads: true, themes: true });
    expect(unknown).toEqual([]);
  });

  it('reports unknown names', () => {
    expect(parseFeatures('leads,shop').unknown).toEqual(['shop']);
  });
});
