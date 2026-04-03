import { Suspense, lazy } from "react";
import {
  type AnimationKey,
  type EffectLayerConfig,
  ALL_ANIMATION_KEYS,
  DEFAULT_SUB_EFFECTS,
} from "@/lib/animationTypes";

const DeepSpaceBackground = lazy(() =>
  import("./DeepSpaceBackground").then((m) => ({ default: m.DeepSpaceBackground })),
);
const AuroraBackground = lazy(() =>
  import("./AuroraBackground").then((m) => ({ default: m.AuroraBackground })),
);
const VoidBackground = lazy(() =>
  import("./VoidBackground").then((m) => ({ default: m.VoidBackground })),
);
const BioluminescenceBackground = lazy(() =>
  import("./BioluminescenceBackground").then((m) => ({ default: m.BioluminescenceBackground })),
);
const ConstellationBackground = lazy(() =>
  import("./ConstellationBackground").then((m) => ({ default: m.ConstellationBackground })),
);
const LavaLampBackground = lazy(() =>
  import("./LavaLampBackground").then((m) => ({ default: m.LavaLampBackground })),
);
const SynthwaveBackground = lazy(() =>
  import("./SynthwaveBackground").then((m) => ({ default: m.SynthwaveBackground })),
);
const PuddleRipplesBackground = lazy(() =>
  import("./PuddleRipplesBackground").then((m) => ({ default: m.PuddleRipplesBackground })),
);
const FishtankBackground = lazy(() =>
  import("./FishtankBackground").then((m) => ({ default: m.FishtankBackground })),
);
const ParticleWebBackground = lazy(() =>
  import("./ParticleWebBackground").then((m) => ({ default: m.ParticleWebBackground })),
);
const StormBackground = lazy(() =>
  import("./StormBackground").then((m) => ({ default: m.StormBackground })),
);
const SakuraBackground = lazy(() =>
  import("./SakuraBackground").then((m) => ({ default: m.SakuraBackground })),
);

interface Props {
  effectMix: EffectLayerConfig;
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  paused: boolean;
  preview?: boolean;
}

// Z-index order: lower = further back in the stack
const LAYER_Z_INDEX: Record<AnimationKey, number> = {
  deepspace: 1,
  aurora: 2,
  void: 3,
  bioluminescence: 4,
  constellation: 5,
  lavalamp: 6,
  synthwave: 7,
  puddleripples: 8,
  fishtank: 9,
  particleweb: 10,
  storm: 11,
  sakura: 12,
};

function renderEffect(
  key: AnimationKey,
  shared: {
    colorLeft: string;
    colorMiddle: string;
    colorRight: string;
    paused: boolean;
    preview?: boolean;
  },
  subEffects: EffectLayerConfig[AnimationKey],
) {
  const defaults = DEFAULT_SUB_EFFECTS[key];
  const merged = { ...defaults, ...(subEffects ?? {}) };

  switch (key) {
    case "deepspace":
      return <DeepSpaceBackground {...shared} {...(merged as typeof defaults)} />;
    case "aurora":
      return <AuroraBackground {...shared} {...(merged as typeof defaults)} />;
    case "void":
      return <VoidBackground {...shared} {...(merged as typeof defaults)} />;
    case "bioluminescence":
      return <BioluminescenceBackground {...shared} {...(merged as typeof defaults)} />;
    case "constellation":
      return <ConstellationBackground {...shared} {...(merged as typeof defaults)} />;
    case "lavalamp":
      return <LavaLampBackground {...shared} {...(merged as typeof defaults)} />;
    case "synthwave":
      return <SynthwaveBackground {...shared} {...(merged as typeof defaults)} />;
    case "puddleripples":
      return <PuddleRipplesBackground {...shared} {...(merged as typeof defaults)} />;
    case "fishtank":
      return <FishtankBackground {...shared} {...(merged as typeof defaults)} />;
    case "particleweb":
      return <ParticleWebBackground {...shared} {...(merged as typeof defaults)} />;
    case "storm":
      return <StormBackground {...shared} {...(merged as typeof defaults)} />;
    case "sakura":
      return <SakuraBackground {...shared} {...(merged as typeof defaults)} />;
    default:
      return null;
  }
}

export function CompositeBackground({
  effectMix,
  colorLeft,
  colorMiddle,
  colorRight,
  paused,
  preview = false,
}: Props) {
  const shared = { colorLeft, colorMiddle, colorRight, paused, preview };
  const enabledKeys = ALL_ANIMATION_KEYS.filter((k) => k in effectMix);

  return (
    <div className={`${preview ? "absolute" : "fixed"} pointer-events-none inset-0 z-0`}>
      {enabledKeys.map((key) => (
        <div key={key} className="absolute inset-0" style={{ zIndex: LAYER_Z_INDEX[key] }}>
          <Suspense fallback={null}>{renderEffect(key, shared, effectMix[key])}</Suspense>
        </div>
      ))}
    </div>
  );
}
