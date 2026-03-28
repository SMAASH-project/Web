import { useEffect, useRef } from "react";

interface Props {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  paused?: boolean;
}

interface Star {
  x: number;
  y: number;
  // Slow parallax drift
  vx: number;
  vy: number;
  size: number;
  twinklePhase: number;
  twinkleSpeed: number;
  brightness: number; // base brightness 0–1
}

interface ConstellationLine {
  a: number; // star index
  b: number; // star index
  // fade in/out cycle
  phase: number;
  cycleSpeed: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}

const STAR_COUNT = 110;
const MIN_CONNECT_DIST = 80;
const MAX_CONNECT_DIST = 190;
// Max lines to avoid clutter
const MAX_LINES = 55;

export function ConstellationBackground({ colorLeft, colorMiddle, colorRight, paused = false }: Props) {
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

    const [lr, lg, lb] = hexToRgb(colorLeft);
    const [mr, mg, mb] = hexToRgb(colorMiddle);
    const [rr, rg, rb] = hexToRgb(colorRight);

    let animId: number;
    let lastTime = performance.now();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Build stars
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.06,
      vy: (Math.random() - 0.5) * 0.04,
      size: 0.6 + Math.random() * 2.0,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.5 + Math.random() * 1.2,
      brightness: 0.5 + Math.random() * 0.5,
    }));

    // Build constellation lines between nearby stars
    const lines: ConstellationLine[] = [];
    for (let i = 0; i < stars.length && lines.length < MAX_LINES; i++) {
      for (let j = i + 1; j < stars.length && lines.length < MAX_LINES; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= MIN_CONNECT_DIST && dist <= MAX_CONNECT_DIST) {
          lines.push({
            a: i,
            b: j,
            phase: Math.random() * Math.PI * 2,
            cycleSpeed: 0.15 + Math.random() * 0.25,
          });
        }
      }
    }

    function draw(now: number) {
      animId = requestAnimationFrame(draw);
      if (pausedRef.current) return;
      if (!canvas || !ctx) return;

      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Subtle background gradient tint
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0,   `rgba(${lr},${lg},${lb},0.12)`);
      bg.addColorStop(0.5, `rgba(${mr},${mg},${mb},0.08)`);
      bg.addColorStop(1,   `rgba(${rr},${rg},${rb},0.12)`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Advance star state
      for (const s of stars) {
        s.twinklePhase += s.twinkleSpeed * dt;
        s.x += s.vx;
        s.y += s.vy;
        // Wrap
        if (s.x < 0) s.x = w;
        else if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h;
        else if (s.y > h) s.y = 0;
      }

      // Draw constellation lines
      for (const line of lines) {
        line.phase += line.cycleSpeed * dt;
        // Fade in and out on a slow sinusoidal cycle
        const alpha = Math.max(0, 0.5 + 0.5 * Math.sin(line.phase)) * 0.28;
        if (alpha < 0.005) continue;

        const sa = stars[line.a];
        const sb = stars[line.b];

        // Gradient line from star a color to star b color
        const grad = ctx.createLinearGradient(sa.x, sa.y, sb.x, sb.y);
        grad.addColorStop(0, `rgba(${mr},${mg},${mb},${alpha.toFixed(3)})`);
        grad.addColorStop(1, `rgba(${rr},${rg},${rb},${alpha.toFixed(3)})`);

        ctx.beginPath();
        ctx.moveTo(sa.x, sa.y);
        ctx.lineTo(sb.x, sb.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Draw stars
      for (const s of stars) {
        const twinkle = 0.6 + 0.4 * Math.sin(s.twinklePhase);
        const alpha = s.brightness * twinkle;

        // Soft glow for larger stars
        if (s.size > 1.4) {
          const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 4);
          glow.addColorStop(0, `rgba(${mr},${mg},${mb},${(alpha * 0.3).toFixed(3)})`);
          glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star point
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,230,255,${alpha.toFixed(3)})`;
        ctx.fill();
      }

      // Vignette
      const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.85);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.48)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
    }

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [colorLeft, colorMiddle, colorRight]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 opacity-90 pointer-events-none"
    />
  );
}
