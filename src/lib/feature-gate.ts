import { isFeatureEnabled } from "@/lib/feature-flags";

export interface EnabledFeatures {
  storeEnabled: boolean;
  challengesEnabled: boolean;
  premiumEnabled: boolean;
  eventsEnabled: boolean;
}

/**
 * Load all feature flags in parallel.
 * Call once in a server component / layout and pass down as props.
 */
export async function getEnabledFeatures(): Promise<EnabledFeatures> {
  const [storeEnabled, challengesEnabled, premiumEnabled, eventsEnabled] = await Promise.all([
    isFeatureEnabled("store_enabled"),
    isFeatureEnabled("challenges_enabled"),
    isFeatureEnabled("premium_enabled"),
    isFeatureEnabled("events_enabled"),
  ]);

  return { storeEnabled, challengesEnabled, premiumEnabled, eventsEnabled };
}
