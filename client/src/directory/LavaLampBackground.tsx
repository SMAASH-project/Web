interface Props {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
}

const KEYFRAMES = `
@keyframes lava-blob-1 {
  0%   { transform: translate(0%,   0%)   scale(1);    border-radius: 60% 40% 55% 45% / 50% 60% 40% 50%; }
  25%  { transform: translate(8%,  -18%)  scale(1.12); border-radius: 40% 60% 45% 55% / 60% 40% 55% 45%; }
  50%  { transform: translate(-6%,  12%)  scale(0.9);  border-radius: 55% 45% 60% 40% / 45% 55% 50% 50%; }
  75%  { transform: translate(12%, -5%)   scale(1.08); border-radius: 45% 55% 40% 60% / 55% 45% 60% 40%; }
  100% { transform: translate(0%,   0%)   scale(1);    border-radius: 60% 40% 55% 45% / 50% 60% 40% 50%; }
}
@keyframes lava-blob-2 {
  0%   { transform: translate(0%,   0%)   scale(1);    border-radius: 45% 55% 50% 50% / 60% 40% 50% 50%; }
  30%  { transform: translate(-10%, 15%)  scale(1.15); border-radius: 60% 40% 45% 55% / 40% 60% 55% 45%; }
  60%  { transform: translate(7%,  -10%)  scale(0.88); border-radius: 40% 60% 55% 45% / 55% 45% 40% 60%; }
  100% { transform: translate(0%,   0%)   scale(1);    border-radius: 45% 55% 50% 50% / 60% 40% 50% 50%; }
}
@keyframes lava-blob-3 {
  0%   { transform: translate(0%,   0%)   scale(1);    border-radius: 50% 50% 40% 60% / 45% 55% 60% 40%; }
  40%  { transform: translate(12%, -20%)  scale(1.2);  border-radius: 40% 60% 60% 40% / 60% 40% 40% 60%; }
  70%  { transform: translate(-8%,  8%)   scale(0.92); border-radius: 60% 40% 40% 60% / 40% 60% 60% 40%; }
  100% { transform: translate(0%,   0%)   scale(1);    border-radius: 50% 50% 40% 60% / 45% 55% 60% 40%; }
}
@keyframes lava-blob-4 {
  0%   { transform: translate(0%,   0%)   scale(1);    border-radius: 55% 45% 50% 50% / 50% 50% 45% 55%; }
  35%  { transform: translate(-14%, 10%)  scale(1.1);  border-radius: 45% 55% 60% 40% / 60% 40% 55% 45%; }
  65%  { transform: translate(9%,  -15%)  scale(0.85); border-radius: 60% 40% 45% 55% / 40% 60% 50% 50%; }
  100% { transform: translate(0%,   0%)   scale(1);    border-radius: 55% 45% 50% 50% / 50% 50% 45% 55%; }
}
@keyframes lava-blob-5 {
  0%   { transform: translate(0%,  0%)  scale(1);    border-radius: 50% 50% 55% 45% / 55% 45% 50% 50%; }
  45%  { transform: translate(6%,  22%) scale(1.18); border-radius: 45% 55% 45% 55% / 45% 55% 55% 45%; }
  100% { transform: translate(0%,  0%)  scale(1);    border-radius: 50% 50% 55% 45% / 55% 45% 50% 50%; }
}
@keyframes lava-blob-6 {
  0%   { transform: translate(0%,   0%)   scale(1);    border-radius: 60% 40% 50% 50% / 50% 60% 45% 55%; }
  50%  { transform: translate(-10%,-18%)  scale(1.22); border-radius: 40% 60% 60% 40% / 60% 40% 55% 45%; }
  100% { transform: translate(0%,   0%)   scale(1);    border-radius: 60% 40% 50% 50% / 50% 60% 45% 55%; }
}
`;

// Static per-blob Tailwind classes — only the background color is injected via style
const BLOB_CONFIG = [
  {
    pos: "left-[10%] top-[60%]",
    size: "w-[35%] h-[40%]",
    blur: "blur-[55px]",
    opacity: "opacity-70",
    anim: "animate-[lava-blob-1_12s_0s_ease-in-out_infinite]",
  },
  {
    pos: "left-[55%] top-[45%]",
    size: "w-[40%] h-[45%]",
    blur: "blur-[60px]",
    opacity: "opacity-65",
    anim: "animate-[lava-blob-2_16s_-4s_ease-in-out_infinite]",
  },
  {
    pos: "left-[25%] top-[15%]",
    size: "w-[38%] h-[42%]",
    blur: "blur-[50px]",
    opacity: "opacity-70",
    anim: "animate-[lava-blob-3_14s_-7s_ease-in-out_infinite]",
  },
  {
    pos: "left-[65%] top-[10%]",
    size: "w-[30%] h-[35%]",
    blur: "blur-[65px]",
    opacity: "opacity-55",
    anim: "animate-[lava-blob-4_18s_-2s_ease-in-out_infinite]",
  },
  {
    pos: "left-[5%]  top-[25%]",
    size: "w-[32%] h-[38%]",
    blur: "blur-[45px]",
    opacity: "opacity-60",
    anim: "animate-[lava-blob-5_10s_-9s_ease-in-out_infinite]",
  },
  {
    pos: "left-[40%] top-[55%]",
    size: "w-[28%] h-[32%]",
    blur: "blur-[55px]",
    opacity: "opacity-50",
    anim: "animate-[lava-blob-6_13s_-5s_ease-in-out_infinite]",
  },
] as const;

export function LavaLampBackground({
  colorLeft,
  colorMiddle,
  colorRight,
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
            style={{ background: blobColors[i] }}
          />
        ))}
      </div>
    </>
  );
}
