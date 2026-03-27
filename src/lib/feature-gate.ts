import { isFeatureEnabled } from "@/lib/feature-flags";

export interface EnabledFeatures {
  storeEnabled: boolean;
  challengesEnabled: boolean;
}

/**
 * Load store and challenges feature flags in parallel.
 * Call once in a server component / layout and pass down as props.
 */
export async function getEnabledFeatures(): Promise<EnabledFeatures> {
  const [storeEnabled, challengesEnabled] = await Promise.all([
    isFeatureEnabled("store_enabled"),
    isFeatureEnabled("challenges_enabled"),
  ]);

  return { storeEnabled, challengesEnabled };
}
