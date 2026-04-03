import { memo, useEffect, useRef, useState } from "react";

interface Props {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  paused?: boolean;
  preview?: boolean;
  showRain?: boolean;
  showLightning?: boolean;
  showClouds?: boolean;
  showGroundShimmer?: boolean;
}

const CLOUD_CSS = `
@keyframes cloud-drift-1 {
  0%   { transform: translateX(-4%); }
  50%  { transform: translateX(4%);  }
  100% { transform: translateX(-4%); }
}
@keyframes cloud-drift-2 {
  0%   { transform: translateX(5%);  }
  50%  { transform: translateX(-3%); }
  100% { transform: translateX(5%);  }
}
@keyframes cloud-drift-3 {
  0%   { transform: translateX(-2%); }
  50%  { transform: translateX(6%);  }
  100% { transform: translateX(-2%); }
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  const full =
    c.length === 3
      ? c
          .split("")
          .map((x) => x + x)
          .join("")
      : c;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
}

interface BoltSegment {
  x: number;
  y: number;
}

function makeBolt(startX: number, endX: number, h: number): BoltSegment[] {
  const segments: BoltSegment[] = [{ x: startX, y: 0 }];
  const steps = 10 + Math.floor(Math.random() * 8);
  for (let i = 1; i < steps; i++) {
    const progress = i / steps;
    const baseX = startX + (endX - startX) * progress;
    const jitter = (Math.random() - 0.5) * 80;
    segments.push({ x: baseX + jitter, y: h * 0.6 * progress });
  }
  segments.push({ x: endX, y: h * 0.6 });
  return segments;
}

export const StormBackground = memo(function StormBackground({
  colorLeft,
  colorMiddle,
  colorRight,
  paused = false,
  preview = false,
  showRain = true,
  showLightning = true,
  showClouds = true,
  showGroundShimmer = true,
}: Props) {
  const rainCanvasRef = useRef<HTMLCanvasElement>(null);
  const boltCanvasRef = useRef<HTMLCanvasElement>(null);
  const [flashAlpha, setFlashAlpha] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const boltRef = useRef<BoltSegment[] | null>(null);
  const boltAlphaRef = useRef(0);

  const [lr, lg, lb] = hexToRgb(colorLeft);
  const [mr, mg, mb] = hexToRgb(colorMiddle);
  const [rr, rg, rb] = hexToRgb(colorRight);

  // ── Rain canvas ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = rainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = preview ? (canvas.parentElement?.offsetWidth ?? 320) : window.innerWidth;
      canvas.height = preview ? (canvas.parentElement?.offsetHeight ?? 200) : window.innerHeight;
    };
    resize();
    if (!preview) window.addEventListener("resize", resize);

    // Build rain drops — three layers
    const drops: RainDrop[] = Array.from({ length: 200 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      length:
        i < 80
          ? 18 + Math.random() * 18 // foreground — long
          : i < 150
            ? 10 + Math.random() * 10 // mid
            : 5 + Math.random() * 6, // background — short
      speed:
        i < 80 ? 14 + Math.random() * 6 : i < 150 ? 9 + Math.random() * 5 : 5 + Math.random() * 4,
      opacity:
        i < 80
          ? 0.5 + Math.random() * 0.25
          : i < 150
            ? 0.3 + Math.random() * 0.2
            : 0.12 + Math.random() * 0.12,
      width: i < 80 ? 1.2 : i < 150 ? 0.8 : 0.5,
    }));

    const ANGLE = 8 * (Math.PI / 180); // slight slant

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      if (showRain) {
        for (const d of drops) {
          d.x += Math.sin(ANGLE) * d.speed;
          d.y += Math.cos(ANGLE) * d.speed;
          if (d.y > h + d.length) {
            d.y = -d.length - Math.random() * 40;
            d.x = Math.random() * (w + 100) - 50;
          }

          ctx!.save();
          ctx!.globalAlpha = d.opacity;
          ctx!.strokeStyle = "rgba(200,225,255,1)";
          ctx!.lineWidth = d.width;
          ctx!.beginPath();
          ctx!.moveTo(d.x, d.y);
          ctx!.lineTo(d.x + Math.sin(ANGLE) * d.length, d.y + Math.cos(ANGLE) * d.length);
          ctx!.stroke();
          ctx!.restore();
        }
      }

      if (!paused) animId = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(animId);
      if (!preview) window.removeEventListener("resize", resize);
    };
  }, [paused, showRain]);

  // ── Lightning bolt canvas ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = boltCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = preview ? (canvas.parentElement?.offsetWidth ?? 320) : window.innerWidth;
      canvas.height = preview ? (canvas.parentElement?.offsetHeight ?? 200) : window.innerHeight;
    };
    resize();
    if (!preview) window.addEventListener("resize", resize);

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      if (showLightning) {
        const bolt = boltRef.current;
        const alpha = boltAlphaRef.current;
        if (bolt && alpha > 0) {
          boltAlphaRef.current = Math.max(0, alpha - 0.04);

          ctx!.save();
          ctx!.globalAlpha = Math.min(1, alpha * 1.4);
          // Outer glow
          ctx!.shadowBlur = 30;
          ctx!.shadowColor = "rgba(200,220,255,0.9)";
          ctx!.strokeStyle = `rgba(230,240,255,${alpha})`;
          ctx!.lineWidth = 3;
          ctx!.beginPath();
          ctx!.moveTo(bolt[0].x, bolt[0].y);
          for (let i = 1; i < bolt.length; i++) {
            ctx!.lineTo(bolt[i].x, bolt[i].y);
          }
          ctx!.stroke();
          // Inner core
          ctx!.shadowBlur = 8;
          ctx!.strokeStyle = `rgba(255,255,255,${Math.min(1, alpha * 1.5)})`;
          ctx!.lineWidth = 1.2;
          ctx!.beginPath();
          ctx!.moveTo(bolt[0].x, bolt[0].y);
          for (let i = 1; i < bolt.length; i++) {
            ctx!.lineTo(bolt[i].x, bolt[i].y);
          }
          ctx!.stroke();
          ctx!.restore();
        }
      }
      if (!paused) animId = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(animId);
      if (!preview) window.removeEventListener("resize", resize);
    };
  }, [paused, showLightning]);

  // ── Lightning timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (preview || !showLightning) return;
    function scheduleNext() {
      const delay = 2800 + Math.random() * 5500;
      timerRef.current = setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const startX = w * 0.2 + Math.random() * w * 0.6;
        const endX = startX + (Math.random() - 0.5) * w * 0.3;
        boltRef.current = makeBolt(startX, endX, h);
        boltAlphaRef.current = 1.0;
        setFlashAlpha(0.55);
        setTimeout(() => setFlashAlpha(0), 80);
        setTimeout(() => setFlashAlpha(0.3), 130);
        setTimeout(() => setFlashAlpha(0), 220);
        setTimeout(scheduleNext, 600);
      }, delay);
    }
    scheduleNext();
    return () => clearTimeout(timerRef.current);
  }, [preview, showLightning]);

  return (
    <>
      <style>{CLOUD_CSS}</style>

      <div
        className={`${preview ? "absolute" : "fixed"} pointer-events-none inset-0 z-0 overflow-hidden`}
      >
        {/* Dark storm atmosphere */}
        <div className="absolute inset-0 bg-[rgba(2,4,12,0.45)]" />

        {/* Cloud layers */}
        {showClouds && (
          <>
            {/* Cloud layer 1 — wide, low */}
            <div
              className="absolute top-[-10%] left-[-18%] h-[48%] w-[85%] animate-[cloud-drift-1_26s_ease-in-out_infinite] blur-[35px]"
              style={{
                background: `radial-gradient(ellipse 100% 75% at 35% 45%, rgba(${lr},${lg},${lb},0.62) 0%, transparent 70%)`,
              }}
            />
            {/* Cloud layer 2 */}
            <div
              className="absolute top-[-6%] left-[28%] h-[50%] w-[95%] animate-[cloud-drift-2_33s_ease-in-out_infinite] blur-[42px]"
              style={{
                background: `radial-gradient(ellipse 100% 85% at 55% 40%, rgba(${mr},${mg},${mb},0.52) 0%, transparent 70%)`,
              }}
            />
            {/* Cloud layer 3 — lighter, further back */}
            <div
              className="absolute top-[0%] left-[45%] h-[40%] w-[75%] animate-[cloud-drift-3_40s_ease-in-out_infinite] blur-[28px]"
              style={{
                background: `radial-gradient(ellipse 90% 70% at 50% 50%, rgba(${rr},${rg},${rb},0.40) 0%, transparent 70%)`,
              }}
            />
            {/* Underbelly darkening */}
            <div
              className="absolute inset-x-0 top-[25%] h-[20%] opacity-60 blur-[50px]"
              style={{ background: "rgba(0,0,5,0.7)" }}
            />
          </>
        )}

        {/* Rain canvas */}
        <canvas ref={rainCanvasRef} className="absolute inset-0 h-full w-full" />

        {/* Lightning bolt canvas */}
        <canvas ref={boltCanvasRef} className="absolute inset-0 h-full w-full" />

        {/* Screen flash */}
        {showLightning && flashAlpha > 0 && (
          <div
            className="absolute inset-0"
            style={{ background: `rgba(210,225,255,${flashAlpha})` }}
          />
        )}

        {/* Ground puddle shimmer */}
        {showGroundShimmer && (
          <div
            className="absolute inset-x-0 bottom-0 h-[8%]"
            style={{
              background: `linear-gradient(to top, rgba(${mr},${mg},${mb},0.18), transparent)`,
            }}
          />
        )}
      </div>
    </>
  );
});
