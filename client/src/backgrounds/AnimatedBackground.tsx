import { Suspense, lazy, memo, useEffect, useRef, useState } from "react";
import { type AnimationKey } from "@/lib/animationTypes";

interface Props {
  animationKey: AnimationKey;
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  paused: boolean;
}

const CROSSFADE_MS = 600; // duration of the swap transition

type BackgroundProps = {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  paused: boolean;
};

const DeepSpaceBackground = lazy(() =>
  import("./DeepSpaceBackground").then((m) => ({ default: m.DeepSpaceBackground })),
);
const AuroraBackground = lazy(() =>
  import("./AuroraBackground").then((m) => ({ default: m.AuroraBackground })),
);
const FishtankBackground = lazy(() =>
  import("./FishtankBackground").then((m) => ({ default: m.FishtankBackground })),
);
const LavaLampBackground = lazy(() =>
  import("./LavaLampBackground").then((m) => ({ default: m.LavaLampBackground })),
);
const SynthwaveBackground = lazy(() =>
  import("./SynthwaveBackground").then((m) => ({ default: m.SynthwaveBackground })),
);
const SakuraBackground = lazy(() =>
  import("./SakuraBackground").then((m) => ({ default: m.SakuraBackground })),
);
const StormBackground = lazy(() =>
  import("./StormBackground").then((m) => ({ default: m.StormBackground })),
);
const ParticleWebBackground = lazy(() =>
  import("./ParticleWebBackground").then((m) => ({ default: m.ParticleWebBackground })),
);
const PuddleRipplesBackground = lazy(() =>
  import("./PuddleRipplesBackground").then((m) => ({ default: m.PuddleRipplesBackground })),
);
const BioluminescenceBackground = lazy(() =>
  import("./BioluminescenceBackground").then((m) => ({ default: m.BioluminescenceBackground })),
);
const ConstellationBackground = lazy(() =>
  import("./ConstellationBackground").then((m) => ({ default: m.ConstellationBackground })),
);
const VoidBackground = lazy(() =>
  import("./VoidBackground").then((m) => ({ default: m.VoidBackground })),
);

interface Layer {
  id: number;
  key: AnimationKey;
  visible: boolean; // drives opacity — CSS transition handles the fade
}

function makeBackground(key: AnimationKey, shared: BackgroundProps): React.ReactNode {
  switch (key) {
    case "fishtank":
      return <FishtankBackground {...shared} />;
    case "deepspace":
      return <DeepSpaceBackground {...shared} />;
    case "aurora":
      return <AuroraBackground {...shared} />;
    case "lavalamp":
      return <LavaLampBackground {...shared} />;
    case "synthwave":
      return <SynthwaveBackground {...shared} />;
    case "sakura":
      return <SakuraBackground {...shared} />;
    case "storm":
      return <StormBackground {...shared} />;
    case "particleweb":
      return <ParticleWebBackground {...shared} />;
    case "puddleripples":
      return <PuddleRipplesBackground {...shared} />;
    case "bioluminescence":
      return <BioluminescenceBackground {...shared} />;
    case "constellation":
      return <ConstellationBackground {...shared} />;
    case "void":
      return <VoidBackground {...shared} />;
    default:
      return null;
  }
}

export const AnimatedBackground = memo(function AnimatedBackground({
  animationKey,
  colorLeft,
  colorMiddle,
  colorRight,
  paused,
}: Props) {
  // Crossfade layers
  const layerIdRef = useRef(0);
  const [layers, setLayers] = useState<Layer[]>([
    { id: layerIdRef.current, key: animationKey, visible: true },
  ]);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip crossfade on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const newId = ++layerIdRef.current;

    // Add new layer (invisible) alongside the current one
    setLayers((prev) => [...prev, { id: newId, key: animationKey, visible: false }]);

    // On the next paint: fade in new, fade out old
    const fadeId = setTimeout(() => {
      setLayers((prev) =>
        prev.map((l) => (l.id === newId ? { ...l, visible: true } : { ...l, visible: false })),
      );
    }, 20); // one rAF tick is enough

    // After crossfade completes: remove old layers
    const cleanId = setTimeout(() => {
      setLayers((prev) => prev.filter((l) => l.id === newId));
    }, 20 + CROSSFADE_MS);

    return () => {
      clearTimeout(fadeId);
      clearTimeout(cleanId);
    };
  }, [animationKey]);

  const shared = { colorLeft, colorMiddle, colorRight, paused };

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {layers.map((layer) => (
        // Inner layer: crossfade wrapper per animation
        <div
          key={layer.id}
          className="absolute inset-0"
          style={{
            opacity: layer.visible ? 1 : 0,
            transition: `opacity ${CROSSFADE_MS}ms ease-in-out`,
          }}
        >
          <Suspense fallback={null}>{makeBackground(layer.key, shared)}</Suspense>
        </div>
      ))}
    </div>
  );
});
