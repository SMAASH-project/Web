import { useEffect, useRef } from "react";

interface Props {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  paused?: boolean;
}

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;       // pulse phase offset (radians)
  pulseSpeed: number;
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}

// Palette of deep-sea bioluminescent colors
const PALETTE: [number, number, number][] = [
  [0, 220, 180],   // teal
  [0, 180, 255],   // electric blue
  [0, 255, 140],   // sea green
  [80, 140, 255],  // indigo blue
  [0, 200, 220],   // cyan
  [40, 255, 180],  // mint
];

const ORB_COUNT = 38;

export function BioluminescenceBackground({ paused = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Build orbs
    const orbs: Orb[] = Array.from({ length: ORB_COUNT }, (_, i) => {
      const [r, g, b] = PALETTE[i % PALETTE.length];
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.18,
        radius: 18 + Math.random() * 55,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.4 + Math.random() * 0.6,
        r, g, b,
      };
    });

    function draw(now: number) {
      animId = requestAnimationFrame(draw);
      if (pausedRef.current) return;

      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      for (const orb of orbs) {
        // Advance phase
        orb.phase += orb.pulseSpeed * dt;

        // Pulse: opacity oscillates between 0.06 and 0.52
        const pulse = 0.5 + 0.5 * Math.sin(orb.phase);
        const alpha = 0.06 + pulse * 0.46;

        // Glow: large soft outer halo + brighter inner core
        const halo = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius * 2.8);
        halo.addColorStop(0,   `rgba(${orb.r},${orb.g},${orb.b},${(alpha * 0.9).toFixed(3)})`);
        halo.addColorStop(0.35,`rgba(${orb.r},${orb.g},${orb.b},${(alpha * 0.4).toFixed(3)})`);
        halo.addColorStop(1,   `rgba(${orb.r},${orb.g},${orb.b},0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius * 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        const core = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius * 0.5);
        core.addColorStop(0, `rgba(255,255,255,${(alpha * 0.35).toFixed(3)})`);
        core.addColorStop(1, `rgba(${orb.r},${orb.g},${orb.b},0)`);
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Drift — wrap at edges
        orb.x += orb.vx;
        orb.y += orb.vy;
        const pad = orb.radius * 3;
        if (orb.x < -pad) orb.x = w + pad;
        else if (orb.x > w + pad) orb.x = -pad;
        if (orb.y < -pad) orb.y = h + pad;
        else if (orb.y > h + pad) orb.y = -pad;
      }

      // Deep vignette to reinforce the abyssal feel
      const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.15, w / 2, h / 2, h * 0.85);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
    }

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 opacity-90 pointer-events-none"
    />
  );
}
