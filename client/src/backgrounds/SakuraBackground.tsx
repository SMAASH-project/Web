import { useMemo } from "react";

interface Props {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  paused?: boolean;
  preview?: boolean;
  showPetals?: boolean;
  showBokeh?: boolean;
}

const KEYFRAMES = `
@keyframes sakura-fall {
  0%   { transform: translateY(-60px) translateX(0px) rotate(0deg) scale(1); opacity: 0; }
  5%   { opacity: 1; }
  90%  { opacity: 0.85; }
  100% { transform: translateY(110vh) translateX(var(--drift)) rotate(var(--rot-end)) scale(0.7); opacity: 0; }
}
@keyframes sakura-sway {
  0%   { margin-left: 0px; }
  25%  { margin-left: var(--sway); }
  75%  { margin-left: calc(var(--sway) * -0.6); }
  100% { margin-left: 0px; }
}
`;

const PETAL_SHAPES = [
  "60% 40% 55% 45% / 50% 60% 40% 50%",
  "50% 50% 30% 70% / 60% 40% 60% 40%",
  "70% 30% 50% 50% / 40% 60% 50% 50%",
  "40% 60% 60% 40% / 50% 50% 60% 40%",
];

export function SakuraBackground({
  colorLeft,
  colorMiddle,
  colorRight,
  paused = false,
  preview = false,
  showPetals = true,
  showBokeh = true,
}: Props) {
  const colors = [
    colorLeft,
    colorMiddle,
    colorRight,
    "#ffb7c5",
    "#ffc0cb",
    "#ffe4e8",
    "#ffd1dc",
  ];

  const petals = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => {
        const duration = 7 + (i % 8) * 1.5;
        const delay = -((i * 1.3) % 14);
        return {
          left: (i * 31 + 7) % 100,
          size: 8 + (i % 7) * 2.5,
          duration,
          delay,
          drift: (i % 2 === 0 ? 1 : -1) * (30 + (i % 5) * 20),
          rotEnd: (i % 2 === 0 ? 1 : -1) * (180 + (i % 4) * 90),
          sway: (i % 2 === 0 ? 1 : -1) * (15 + (i % 4) * 10),
          color: colors[i % colors.length],
          opacity: 0.6 + (i % 5) * 0.08,
          borderRadius: PETAL_SHAPES[i % PETAL_SHAPES.length],
          rotate: i * 37,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colorLeft, colorMiddle, colorRight],
  );

  return (
    <>
      <style>{KEYFRAMES}</style>

      <div className={`${preview ? "absolute" : "fixed"} inset-0 z-0 pointer-events-none overflow-hidden`}>
        {showPetals && petals.map((p, i) => (
          <div
            key={i}
            className="absolute -top-15 blur-[0.4px] will-change-[transform,opacity]"
            style={{
              left: `${p.left}vw`,
              width: `${p.size}px`,
              height: `${p.size * 0.85}px`,
              background: p.color,
              borderRadius: p.borderRadius,
              opacity: p.opacity,
              transform: `rotate(${p.rotate}deg)`,
              ["--drift" as string]: `${p.drift}px`,
              ["--rot-end" as string]: `${p.rotEnd}deg`,
              ["--sway" as string]: `${p.sway}px`,
              animation:
                `sakura-fall ${p.duration}s ${p.delay}s linear infinite, ` +
                `sakura-sway ${p.duration * 0.6}s ${p.delay}s ease-in-out infinite`,
              animationPlayState: paused ? "paused" : "running",
            }}
          />
        ))}

        {/* Bokeh circles */}
        {showBokeh && Array.from({ length: 12 }, (_, i) => (
          <div
            key={`bokeh-${i}`}
            className="absolute rounded-full blur-[18px]"
            style={{
              top: `${(i * 43 + 15) % 90}%`,
              left: `${(i * 67 + 8) % 95}%`,
              width: `${20 + (i % 5) * 15}px`,
              height: `${20 + (i % 5) * 15}px`,
              background: colors[i % colors.length],
              opacity: 0.08 + (i % 4) * 0.03,
            }}
          />
        ))}
      </div>
    </>
  );
}
