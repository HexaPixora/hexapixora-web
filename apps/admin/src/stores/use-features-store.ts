import { create } from 'zustand';

/** Optional features the API can switch off with FEATURES (GET /features). */
export type Feature = 'leads' | 'newsletter' | 'push' | 'automation' | 'themes' | 'search';

interface FeaturesState {
  /** null until loaded; the admin layout loads it with the session. */
  features: Partial<Record<Feature, boolean>> | null;
  setFeatures: (features: Partial<Record<Feature, boolean>>) => void;
}

export const useFeaturesStore = create<FeaturesState>()((set) => ({
  features: null,
  setFeatures: (features) => set({ features }),
}));

/** Whether a feature is on. Unknown counts as on, matching the API's default. */
export function isFeatureOn(features: FeaturesState['features'], feature: Feature): boolean {
  return features?.[feature] !== false;
}

export function useFeature(feature: Feature): boolean {
  return useFeaturesStore((state) => isFeatureOn(state.features, feature));
}
