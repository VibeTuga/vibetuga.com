import { getFeatureFlags } from "@/lib/feature-flags";
import { FeatureFlagsManager } from "./FeatureFlagsManager";

export const metadata = {
  title: "Feature Flags — Admin | VibeTuga",
};

export default async function FeatureFlagsPage() {
  const flags = await getFeatureFlags();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-black text-xl uppercase tracking-tight text-white">
          Feature Flags
        </h1>
        <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
          Gerir funcionalidades e rollouts graduais
        </p>
      </div>

      <FeatureFlagsManager initialFlags={JSON.parse(JSON.stringify(flags))} />
    </div>
  );
}
