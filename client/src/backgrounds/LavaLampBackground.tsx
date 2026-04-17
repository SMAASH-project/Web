import { memo } from "react";

interface Props {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  paused?: boolean;
  preview?: boolean;
  showBlobs?: boolean;
  showHighlight?: boolean;
}

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

export const LavaLampBackground = memo(function LavaLampBackground({
  colorLeft,
  colorMiddle,
  colorRight,
  paused = false,
  preview = false,
  showBlobs = true,
  showHighlight = true,
}: Props) {
  const blobColors = [colorLeft, colorMiddle, colorRight, colorLeft, colorRight, colorMiddle];

  return (
    <div
      className={`${preview ? "absolute" : "fixed"} pointer-events-none inset-0 z-0 overflow-hidden`}
    >
      {/* Warm base glow at bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-[30%] opacity-35"
        style={{
          background: `radial-gradient(ellipse 80% 100% at 50% 100%, ${colorLeft}aa, transparent)`,
        }}
      />

      {/* Blobs */}
      {showBlobs &&
        BLOB_CONFIG.map((cfg, i) => (
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
            {showHighlight && (
              <div
                className="absolute inset-0 overflow-hidden rounded-[inherit]"
                style={{
                  animation: "highlight-sweep 4s ease-in-out infinite",
                  animationPlayState: paused ? "paused" : "running",
                }}
              >
                <div
                  className="absolute top-[8%] left-[-30%] h-[55%] w-[45%] rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.28)",
                    filter: "blur(12px)",
                  }}
                />
              </div>
            )}
          </div>
        ))}

      {/* Top-center cool highlight — glass-ceiling effect */}
      <div
        className="absolute top-0 left-[20%] h-[18%] w-[60%] opacity-20 blur-2xl"
        style={{ background: "rgba(255,255,255,0.6)" }}
      />
    </div>
  );
});
