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
}

export function AnimatedBackground({
  animationKey,
  colorLeft,
  colorMiddle,
  colorRight,
}: Props) {
  const shared = { colorLeft, colorMiddle, colorRight };

  switch (animationKey) {
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
