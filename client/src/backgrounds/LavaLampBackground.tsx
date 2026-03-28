interface Props {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  paused?: boolean;
}

const KEYFRAMES = `
@keyframes lava-blob-1 {
  0%   { transform: translate(0%,   0%)   scale(1);    border-radius: 62% 38% 56% 44% / 52% 62% 38% 48%; }
  20%  { transform: translate(7%,  -22%)  scale(1.14); border-radius: 38% 62% 44% 56% / 62% 38% 56% 44%; }
  45%  { transform: translate(-9%,  15%)  scale(0.88); border-radius: 56% 44% 62% 38% / 44% 56% 48% 52%; }
  70%  { transform: translate(14%, -8%)   scale(1.10); border-radius: 44% 56% 38% 62% / 56% 44% 62% 38%; }
  100% { transform: translate(0%,   0%)   scale(1);    border-radius: 62% 38% 56% 44% / 52% 62% 38% 48%; }
}
@keyframes lava-blob-2 {
  0%   { transform: translate(0%,   0%)   scale(1);    border-radius: 46% 54% 52% 48% / 62% 38% 52% 48%; }
  28%  { transform: translate(-12%, 18%)  scale(1.18); border-radius: 62% 38% 44% 56% / 38% 62% 56% 44%; }
  58%  { transform: translate(9%,  -14%)  scale(0.84); border-radius: 38% 62% 56% 44% / 56% 44% 38% 62%; }
  100% { transform: translate(0%,   0%)   scale(1);    border-radius: 46% 54% 52% 48% / 62% 38% 52% 48%; }
}
@keyframes lava-blob-3 {
  0%   { transform: translate(0%,   0%)   scale(1);    border-radius: 52% 48% 38% 62% / 46% 56% 62% 38%; }
  38%  { transform: translate(15%, -24%)  scale(1.24); border-radius: 38% 62% 62% 38% / 62% 38% 38% 62%; }
  68%  { transform: translate(-11%, 10%)  scale(0.90); border-radius: 62% 38% 38% 62% / 38% 62% 62% 38%; }
  100% { transform: translate(0%,   0%)   scale(1);    border-radius: 52% 48% 38% 62% / 46% 56% 62% 38%; }
}
@keyframes lava-blob-4 {
  0%   { transform: translate(0%,   0%)   scale(1);    border-radius: 56% 44% 52% 48% / 52% 48% 44% 56%; }
  33%  { transform: translate(-16%, 12%)  scale(1.13); border-radius: 44% 56% 62% 38% / 62% 38% 56% 44%; }
  63%  { transform: translate(10%, -18%)  scale(0.83); border-radius: 62% 38% 44% 56% / 38% 62% 52% 48%; }
  100% { transform: translate(0%,   0%)   scale(1);    border-radius: 56% 44% 52% 48% / 52% 48% 44% 56%; }
}
@keyframes lava-blob-5 {
  0%   { transform: translate(0%,  0%)   scale(1);    border-radius: 52% 48% 56% 44% / 56% 44% 52% 48%; }
  42%  { transform: translate(7%,  25%)  scale(1.20); border-radius: 44% 56% 46% 54% / 44% 56% 56% 44%; }
  100% { transform: translate(0%,  0%)   scale(1);    border-radius: 52% 48% 56% 44% / 56% 44% 52% 48%; }
}
@keyframes lava-blob-6 {
  0%   { transform: translate(0%,   0%)   scale(1);    border-radius: 62% 38% 52% 48% / 52% 62% 44% 56%; }
  48%  { transform: translate(-12%,-22%)  scale(1.26); border-radius: 38% 62% 62% 38% / 62% 38% 56% 44%; }
  100% { transform: translate(0%,   0%)   scale(1);    border-radius: 62% 38% 52% 48% / 52% 62% 44% 56%; }
}
@keyframes highlight-sweep {
  0%   { opacity: 0.10; transform: translateX(-60%) skewX(-18deg); }
  40%  { opacity: 0.25; transform: translateX(0%)   skewX(-18deg); }
  100% { opacity: 0.10; transform: translateX(60%)  skewX(-18deg); }
}
`;

const BLOB_CONFIG = [
  {
    pos: "left-[8%]  top-[55%]",
    size: "w-[40%] h-[45%]",
    blur: "blur-[52px]",
    opacity: "opacity-75",
    anim: "animate-[lava-blob-1_11s_0s_ease-in-out_infinite]",
  },
  {
    pos: "left-[52%] top-[42%]",
    size: "w-[44%] h-[50%]",
    blur: "blur-[58px]",
    opacity: "opacity-70",
    anim: "animate-[lava-blob-2_15s_-4s_ease-in-out_infinite]",
  },
  {
    pos: "left-[22%] top-[12%]",
    size: "w-[42%] h-[46%]",
    blur: "blur-[48px]",
    opacity: "opacity-75",
    anim: "animate-[lava-blob-3_13s_-7s_ease-in-out_infinite]",
  },
  {
    pos: "left-[62%] top-[8%]",
    size: "w-[33%] h-[38%]",
    blur: "blur-[62px]",
    opacity: "opacity-60",
    anim: "animate-[lava-blob-4_17s_-2s_ease-in-out_infinite]",
  },
  {
    pos: "left-[3%]  top-[22%]",
    size: "w-[35%] h-[42%]",
    blur: "blur-[44px]",
    opacity: "opacity-65",
    anim: "animate-[lava-blob-5_9s_-9s_ease-in-out_infinite]",
  },
  {
    pos: "left-[38%] top-[52%]",
    size: "w-[30%] h-[35%]",
    blur: "blur-[52px]",
    opacity: "opacity-55",
    anim: "animate-[lava-blob-6_12s_-5s_ease-in-out_infinite]",
  },
] as const;

export function LavaLampBackground({
  colorLeft,
  colorMiddle,
  colorRight,
  paused = false,
}: Props) {
  const blobColors = [
    colorLeft,
    colorMiddle,
    colorRight,
    colorLeft,
    colorRight,
    colorMiddle,
  ];

  return (
    <>
      <style>{KEYFRAMES}</style>

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Warm base glow at bottom */}
        <div
          className="absolute bottom-0 inset-x-0 h-[30%] opacity-35"
          style={{
            background: `radial-gradient(ellipse 80% 100% at 50% 100%, ${colorLeft}aa, transparent)`,
          }}
        />

        {/* Blobs */}
        {BLOB_CONFIG.map((cfg, i) => (
          <div
            key={i}
            className={[
              "absolute will-change-[transform,border-radius]",
              cfg.pos,
              cfg.size,
              cfg.blur,
              cfg.opacity,
              cfg.anim,
            ].join(" ")}
            style={{
              background: blobColors[i],
              // Outer glow
              boxShadow: `0 0 80px 30px ${blobColors[i]}88`,
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            {/* Inner shimmer highlight */}
            <div
              className="absolute inset-0 rounded-[inherit] overflow-hidden"
              style={{
                animation: "highlight-sweep 4s ease-in-out infinite",
                animationPlayState: paused ? "paused" : "running",
              }}
            >
              <div
                className="absolute top-[8%] left-[-30%] w-[45%] h-[55%] rounded-full"
                style={{
                  background: "rgba(255,255,255,0.28)",
                  filter: "blur(12px)",
                }}
              />
            </div>
          </div>
        ))}

        {/* Top-center cool highlight — glass-ceiling effect */}
        <div
          className="absolute top-0 left-[20%] w-[60%] h-[18%] blur-2xl opacity-20"
          style={{ background: "rgba(255,255,255,0.6)" }}
        />
      </div>
    </>
  );
}
