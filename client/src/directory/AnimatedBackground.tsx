import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { type AnimationKey } from "@/lib/animationTypes";

import { DeepSpaceBackground } from "./DeepSpaceBackground";
import { AuroraBackground } from "./AuroraBackground";
import { FishtankBackground } from "./FishtankBackground";
import { LavaLampBackground } from "./LavaLampBackground";
import { SynthwaveBackground } from "./SynthwaveBackground";
import { SakuraBackground } from "./SakuraBackground";
import { StormBackground } from "./StormBackground";

interface Props {
  animationKey: AnimationKey;
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  paused: boolean;
}

const FADE_IN_ROUTES = ["/app/settings", "/app/profile", "/app/admin"];
const FADE_IN_DELAY_MS = 1600; // >= CardAnimation spring visualDuration (1.5 s)
const FADE_IN_DURATION_MS = 400;
const CROSSFADE_MS = 600; // duration of the swap transition

interface Layer {
  id: number;
  key: AnimationKey;
  visible: boolean; // drives opacity — CSS transition handles the fade
}

function makeBackground(
  key: AnimationKey,
  shared: {
    colorLeft: string;
    colorMiddle: string;
    colorRight: string;
    paused: boolean;
  },
): React.ReactNode {
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
    default:
      return null;
  }
}

export function AnimatedBackground({
  animationKey,
  colorLeft,
  colorMiddle,
  colorRight,
  paused,
}: Props) {
  const { pathname } = useLocation();
  const shouldDefer = FADE_IN_ROUTES.includes(pathname);

  // Route-based deferred visibility (settings / profile / admin)
  const [routeVisible, setRouteVisible] = useState(!shouldDefer);
  useEffect(() => {
    if (!shouldDefer) {
      setRouteVisible(true);
      return;
    }
    setRouteVisible(false);
    const id = setTimeout(() => setRouteVisible(true), FADE_IN_DELAY_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
    setLayers((prev) => [
      ...prev,
      { id: newId, key: animationKey, visible: false },
    ]);

    // On the next paint: fade in new, fade out old
    const fadeId = setTimeout(() => {
      setLayers((prev) =>
        prev.map((l) =>
          l.id === newId ? { ...l, visible: true } : { ...l, visible: false },
        ),
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
    // Only re-run when the animation key actually changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationKey]);

  const shared = { colorLeft, colorMiddle, colorRight, paused };

  return (
    // Outer wrapper: route-based deferred fade
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        opacity: routeVisible ? 1 : 0,
        transition: routeVisible
          ? `opacity ${FADE_IN_DURATION_MS}ms ease-in`
          : "none",
      }}
    >
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
          {makeBackground(layer.key, shared)}
        </div>
      ))}
    </div>
  );
}
