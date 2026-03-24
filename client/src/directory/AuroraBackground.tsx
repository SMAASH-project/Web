interface Props {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
}

const KEYFRAMES = `
@keyframes aurora-drift-1 {
  0%   { transform: translateX(-8%) scaleY(1)    translateY(0%);  opacity: 0.55; }
  33%  { transform: translateX(6%)  scaleY(1.15) translateY(-3%); opacity: 0.7;  }
  66%  { transform: translateX(-4%) scaleY(0.9)  translateY(2%);  opacity: 0.5;  }
  100% { transform: translateX(-8%) scaleY(1)    translateY(0%);  opacity: 0.55; }
}
@keyframes aurora-drift-2 {
  0%   { transform: translateX(5%)  scaleY(1.1)  translateY(-2%); opacity: 0.5;  }
  40%  { transform: translateX(-7%) scaleY(0.85) translateY(3%);  opacity: 0.65; }
  75%  { transform: translateX(3%)  scaleY(1.2)  translateY(-1%); opacity: 0.45; }
  100% { transform: translateX(5%)  scaleY(1.1)  translateY(-2%); opacity: 0.5;  }
}
@keyframes aurora-drift-3 {
  0%   { transform: translateX(-3%) scaleY(0.9)  translateY(1%);  opacity: 0.4;  }
  50%  { transform: translateX(8%)  scaleY(1.15) translateY(-3%); opacity: 0.6;  }
  100% { transform: translateX(-3%) scaleY(0.9)  translateY(1%);  opacity: 0.4;  }
}
@keyframes aurora-drift-4 {
  0%   { transform: translateX(2%)  scaleY(1.05) translateY(0%);  opacity: 0.45; }
  35%  { transform: translateX(-6%) scaleY(1.2)  translateY(-4%); opacity: 0.6;  }
  70%  { transform: translateX(4%)  scaleY(0.88) translateY(2%);  opacity: 0.35; }
  100% { transform: translateX(2%)  scaleY(1.05) translateY(0%);  opacity: 0.45; }
}
@keyframes aurora-drift-5 {
  0%   { transform: translateX(-5%) scaleY(1.1)  translateY(-1%); opacity: 0.38; }
  45%  { transform: translateX(7%)  scaleY(0.9)  translateY(2%);  opacity: 0.55; }
  100% { transform: translateX(-5%) scaleY(1.1)  translateY(-1%); opacity: 0.38; }
}
`;

// Static per-ribbon Tailwind classes — only the gradient color is injected via style
const RIBBON_CONFIG = [
  {
    top: "top-[5%]",
    h: "h-[28%]",
    blur: "blur-[55px]",
    anim: "animate-[aurora-drift-1_14s_0s_ease-in-out_infinite]",
  },
  {
    top: "top-[18%]",
    h: "h-[32%]",
    blur: "blur-[65px]",
    anim: "animate-[aurora-drift-2_18s_-5s_ease-in-out_infinite]",
  },
  {
    top: "top-[10%]",
    h: "h-[25%]",
    blur: "blur-[50px]",
    anim: "animate-[aurora-drift-3_22s_-9s_ease-in-out_infinite]",
  },
  {
    top: "top-[30%]",
    h: "h-[22%]",
    blur: "blur-[70px]",
    anim: "animate-[aurora-drift-4_16s_-3s_ease-in-out_infinite]",
  },
  {
    top: "top-[2%]",
    h: "h-[20%]",
    blur: "blur-[45px]",
    anim: "animate-[aurora-drift-5_20s_-12s_ease-in-out_infinite]",
  },
] as const;

// Deterministic star positions derived from index — no Math.random() in render
const STARS = Array.from({ length: 60 }, (_, i) => ({
  top: `${(i * 53 + 17) % 60}%`,
  left: `${(i * 37 + 13) % 100}%`,
  size: 1 + (i % 3),
  opacity: 0.3 + (i % 5) * 0.1,
}));

export function AuroraBackground({
  colorLeft,
  colorMiddle,
  colorRight,
}: Props) {
  const ribbonColors = [
    colorLeft,
    colorMiddle,
    colorRight,
    colorLeft,
    colorRight,
  ];

  return (
    <>
      <style>{KEYFRAMES}</style>

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {RIBBON_CONFIG.map((cfg, i) => (
          <div
            key={i}
            className={[
              "absolute -left-[10%] w-[120%] rounded-full will-change-[transform,opacity]",
              cfg.top,
              cfg.h,
              cfg.blur,
              cfg.anim,
            ].join(" ")}
            style={{
              background: `radial-gradient(ellipse 80% 100% at 50% 50%, ${ribbonColors[i]}cc 0%, ${ribbonColors[i]}55 50%, transparent 100%)`,
            }}
          />
        ))}

        {STARS.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity,
            }}
          />
        ))}
      </div>
    </>
  );
}
