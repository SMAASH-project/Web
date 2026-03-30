import { useEffect, useRef } from "react";

interface Props {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  paused?: boolean;
  preview?: boolean;
  showRipples?: boolean;
}

interface Ripple {
  x: number;
  y: number;
  birthTime: number;
  maxRadius: number;
}

const RIPPLE_DURATION = 2800; // ms for one ring to fully expand and fade
const RING_OFFSET = 220;      // ms delay between concentric rings
const RING_COUNT = 3;
const MAX_RIPPLES = 22;
const SPAWN_INTERVAL = 280;   // ms between new ripple spawns

// Parse a hex color string into [r, g, b]
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function PuddleRipplesBackground({
  colorRight,
  paused = false,
  preview = false,
  showRipples = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const rafRef = useRef<number>(0);

  // Keep pausedRef in sync without restarting the loop
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const [r, g, b] = hexToRgb(colorRight);

    // Resize canvas to fill the window
    const resize = () => {
      canvas.width = preview ? (canvas.parentElement?.offsetWidth ?? 320) : window.innerWidth;
      canvas.height = preview ? (canvas.parentElement?.offsetHeight ?? 200) : window.innerHeight;
    };
    resize();
    if (!preview) window.addEventListener("resize", resize);

    const ripples: Ripple[] = [];
    let lastSpawn = performance.now();

    const spawnRipple = (now: number) => {
      if (ripples.length >= MAX_RIPPLES) {
        // Remove the oldest
        ripples.shift();
      }
      ripples.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        birthTime: now,
        maxRadius: 55 + Math.random() * 45, // 55–100px
      });
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (showRipples) {
        for (let i = ripples.length - 1; i >= 0; i--) {
          const ripple = ripples[i];

          for (let ring = 0; ring < RING_COUNT; ring++) {
            const age = (now - ripple.birthTime - ring * RING_OFFSET) / RIPPLE_DURATION;
            if (age < 0 || age > 1) continue;

            const radius = age * ripple.maxRadius;
            const opacity = (1 - age) * 0.5;
            const lineWidth = Math.max(0.4, 2.2 - age * 2);

            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
          }

          // Prune fully expired ripples (last ring done)
          const totalAge = (now - ripple.birthTime - (RING_COUNT - 1) * RING_OFFSET) / RIPPLE_DURATION;
          if (totalAge > 1) {
            ripples.splice(i, 1);
          }
        }
      }
    };

    // Draw one static frame so preview box isn't blank when paused from mount
    draw(performance.now());

    const loop = (now: number) => {
      if (!pausedRef.current) {
        if (now - lastSpawn >= SPAWN_INTERVAL) {
          spawnRipple(now);
          lastSpawn = now;
        }
        draw(now);
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (!preview) window.removeEventListener("resize", resize);
    };
  // Re-initialize when color changes so new ripples use the updated color
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorLeft, colorMiddle, colorRight, showRipples]);

  return (
    <canvas
      ref={canvasRef}
      className={`${preview ? "absolute" : "fixed"} inset-0 z-0 opacity-90 pointer-events-none`}
    />
  );
}
