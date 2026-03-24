import { motion } from "motion/react";

interface Props {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
}

const STAR_TWINKLE = `
@keyframes star-twinkle {
  0%, 100% { opacity: var(--star-base-opacity); transform: scale(1); }
  50%       { opacity: calc(var(--star-base-opacity) * 0.25); transform: scale(0.7); }
}
`;

// Deterministic star grid — no Math.random() in render
const STARS = Array.from({ length: 80 }, (_, i) => ({
  top: `${(i * 53 + 17) % 72}%`,
  left: `${(i * 37 + 13) % 100}%`,
  size: 1 + (i % 3),
  baseOpacity: 0.25 + (i % 6) * 0.09,
  duration: `${2.5 + (i % 5) * 1.1}s`,
  delay: `${-(i % 7) * 0.6}s`,
}));

interface BandConfig {
  top: string;
  h: string;
  blur: string;
  colorIdx: number;
  animate: { x: string[]; scaleY: number[]; opacity: number[] };
  duration: number;
}

// Wide diffuse color bands
const BAND_CONFIG: BandConfig[] = [
  {
    top: "2%",
    h: "38%",
    blur: "blur-[70px]",
    colorIdx: 0,
    animate: {
      x: ["-6%", "5%", "-3%", "7%", "-6%"],
      scaleY: [1, 1.18, 0.88, 1.12, 1],
      opacity: [0.52, 0.72, 0.45, 0.68, 0.52],
    },
    duration: 16,
  },
  {
    top: "14%",
    h: "35%",
    blur: "blur-[80px]",
    colorIdx: 1,
    animate: {
      x: ["4%", "-8%", "6%", "-4%", "4%"],
      scaleY: [1.1, 0.85, 1.2, 0.9, 1.1],
      opacity: [0.45, 0.65, 0.38, 0.6, 0.45],
    },
    duration: 21,
  },
  {
    top: "7%",
    h: "28%",
    blur: "blur-[60px]",
    colorIdx: 2,
    animate: {
      x: ["-4%", "7%", "-6%", "4%", "-4%"],
      scaleY: [0.92, 1.15, 0.88, 1.08, 0.92],
      opacity: [0.38, 0.58, 0.3, 0.52, 0.38],
    },
    duration: 18,
  },
  {
    top: "22%",
    h: "25%",
    blur: "blur-[75px]",
    colorIdx: 0,
    animate: {
      x: ["6%", "-5%", "8%", "-3%", "6%"],
      scaleY: [1.05, 0.9, 1.15, 0.95, 1.05],
      opacity: [0.3, 0.5, 0.25, 0.45, 0.3],
    },
    duration: 25,
  },
];

// Thin vertical curtain fibers — the signature aurora feature
const FIBER_CONFIG = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 4.7 + 1.2) % 100}%`,
  width: `${1.5 + (i % 4) * 1.2}%`,
  height: `${35 + (i % 5) * 8}%`,
  top: `${1 + (i % 6) * 1.8}%`,
  colorIdx: i % 3,
  duration: 4 + (i % 7) * 1.3,
  delay: -(i % 9) * 0.7,
  blur: 14 + (i % 4) * 8,
  baseOpacity: 0.22 + (i % 5) * 0.06,
}));

export function AuroraBackground({
  colorLeft,
  colorMiddle,
  colorRight,
}: Props) {
  const colors = [colorLeft, colorMiddle, colorRight];

  return (
    <>
      <style>{STAR_TWINKLE}</style>

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Dark sky — makes aurora pop */}
        <div className="absolute inset-0 bg-linear-to-b from-[#020818] via-[#050d1c] to-[#0a1428] opacity-75" />

        {/* Wide diffuse color bands */}
        {BAND_CONFIG.map((cfg, i) => (
          <motion.div
            key={`band-${i}`}
            className={`absolute -left-[8%] w-[116%] rounded-full will-change-[transform,opacity] ${cfg.blur}`}
            style={{
              top: cfg.top,
              height: cfg.h,
              background: `radial-gradient(ellipse 85% 100% at 50% 50%, ${colors[cfg.colorIdx]}dd 0%, ${colors[cfg.colorIdx]}66 45%, transparent 100%)`,
            }}
            animate={cfg.animate}
            transition={{
              duration: cfg.duration,
              delay: -(i * 3.1),
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.25, 0.5, 0.75, 1],
            }}
          />
        ))}

        {/* Vertical curtain fibers */}
        {FIBER_CONFIG.map((f, i) => (
          <motion.div
            key={`fiber-${i}`}
            className="absolute will-change-[transform,opacity]"
            style={{
              left: f.left,
              top: f.top,
              width: f.width,
              height: f.height,
              filter: `blur(${f.blur}px)`,
              background: `linear-gradient(to bottom, transparent 0%, ${colors[f.colorIdx]}cc 30%, ${colors[f.colorIdx]}aa 70%, transparent 100%)`,
            }}
            animate={{
              scaleY: [1, 1.3, 0.8, 1.2, 1],
              scaleX: [1, 0.7, 1.2, 0.85, 1],
              opacity: [
                f.baseOpacity,
                f.baseOpacity * 1.8,
                f.baseOpacity * 0.4,
                f.baseOpacity * 1.5,
                f.baseOpacity,
              ],
            }}
            transition={{
              duration: f.duration,
              delay: f.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Stars — twinkling via CSS custom property */}
        {STARS.map((s, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              ["--star-base-opacity" as string]: s.baseOpacity,
              opacity: s.baseOpacity,
              animation: `star-twinkle ${s.duration} ${s.delay} ease-in-out infinite`,
            }}
          />
        ))}

        {/* Faint moon */}
        <div
          className="absolute top-[6%] right-[8%] w-10 h-10 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #fffde0, #e8ddb5 60%, transparent 100%)",
            boxShadow: "0 0 18px 6px rgba(255,253,200,0.18)",
            opacity: 0.55,
          }}
        />
      </div>
    </>
  );
}
