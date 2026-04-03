import { memo, useEffect, useRef } from "react";

interface Props {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  paused?: boolean;
  preview?: boolean;
  showParticles?: boolean;
  showConnections?: boolean;
}

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

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  g: number;
  b: number;
  size: number;
  // Gentle attraction toward mouse
  baseX: number;
  baseY: number;
}

export const ParticleWebBackground = memo(function ParticleWebBackground({
  colorLeft,
  colorMiddle,
  colorRight,
  paused = false,
  preview = false,
  showParticles = true,
  showConnections = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const [lr, lg, lb] = hexToRgb(colorLeft);
    const [mr, mg, mb] = hexToRgb(colorMiddle);
    const [rr, rg, rb] = hexToRgb(colorRight);

    // Interpolate particle color from palette based on index
    function particleColor(i: number, total: number): [number, number, number] {
      const t = i / total;
      if (t < 0.5) {
        const u = t * 2;
        return [
          Math.round(lerp(lr, mr, u)),
          Math.round(lerp(lg, mg, u)),
          Math.round(lerp(lb, mb, u)),
        ];
      } else {
        const u = (t - 0.5) * 2;
        return [
          Math.round(lerp(mr, rr, u)),
          Math.round(lerp(mg, rg, u)),
          Math.round(lerp(mb, rb, u)),
        ];
      }
    }

    let animId: number;
    let t = 0;
    const DT = 1 / 60;

    const resize = () => {
      canvas.width = preview ? (canvas.parentElement?.offsetWidth ?? 320) : window.innerWidth;
      canvas.height = preview ? (canvas.parentElement?.offsetHeight ?? 200) : window.innerHeight;
    };
    resize();
    if (!preview) window.addEventListener("resize", resize);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    if (!preview) {
      window.addEventListener("mousemove", onMouse);
      window.addEventListener("mouseleave", onLeave);
    }

    const COUNT = 80;
    const CONNECTION_DIST = 160;
    const MOUSE_DIST = 200;
    const MOUSE_REPEL = 60; // repulsion radius

    const particles: Particle[] = Array.from({ length: COUNT }, (_, i) => {
      const [r, g, b] = particleColor(i, COUNT);
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r,
        g,
        b,
        size: 1.5 + Math.random() * 2,
        baseX: x,
        baseY: y,
      };
    });

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      t += DT;

      ctx!.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // ── Update particles ─────────────────────────────────────────────────
      for (const p of particles) {
        // Gentle drift
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += (Math.random() - 0.5) * 0.02;

        // Speed cap
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 1.2) {
          p.vx *= 0.98;
          p.vy *= 0.98;
        }

        // Mouse repulsion
        const mdx = p.x - mx;
        const mdy = p.y - my;
        const md = Math.hypot(mdx, mdy);
        if (md < MOUSE_REPEL && md > 0) {
          const force = (MOUSE_REPEL - md) / MOUSE_REPEL;
          p.vx += (mdx / md) * force * 1.5;
          p.vy += (mdy / md) * force * 1.5;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > w) {
          p.vx *= -1;
          p.x = Math.max(0, Math.min(w, p.x));
        }
        if (p.y < 0 || p.y > h) {
          p.vy *= -1;
          p.y = Math.max(0, Math.min(h, p.y));
        }
      }

      // ── Draw connections ─────────────────────────────────────────────────
      if (showConnections) {
        for (let i = 0; i < COUNT; i++) {
          const a = particles[i];
          for (let j = i + 1; j < COUNT; j++) {
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.hypot(dx, dy);

            if (dist < CONNECTION_DIST) {
              const alpha = (1 - dist / CONNECTION_DIST) * 0.45;
              const cr = Math.round((a.r + b.r) / 2);
              const cg = Math.round((a.g + b.g) / 2);
              const cb = Math.round((a.b + b.b) / 2);

              ctx!.beginPath();
              ctx!.moveTo(a.x, a.y);
              ctx!.lineTo(b.x, b.y);
              ctx!.strokeStyle = `rgba(${cr},${cg},${cb},${alpha})`;
              ctx!.lineWidth = 0.8 * (1 - dist / CONNECTION_DIST);
              ctx!.stroke();
            }
          }

          // Mouse connections — within MOUSE_DIST
          const mdx = a.x - mx;
          const mdy = a.y - my;
          const mdist = Math.hypot(mdx, mdy);
          if (mdist < MOUSE_DIST) {
            const alpha = (1 - mdist / MOUSE_DIST) * 0.6;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(mx, my);
            ctx!.strokeStyle = `rgba(${a.r},${a.g},${a.b},${alpha})`;
            ctx!.lineWidth = 1.2 * (1 - mdist / MOUSE_DIST);
            ctx!.stroke();
          }
        }
      }

      // ── Draw particles ───────────────────────────────────────────────────
      if (showParticles)
        for (const p of particles) {
          // Pulse size
          const pulse = p.size + Math.sin(t * 1.5 + p.baseX * 0.01) * 0.4;

          // Glow
          const glow = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulse * 4);
          glow.addColorStop(0, `rgba(${p.r},${p.g},${p.b},0.35)`);
          glow.addColorStop(1, `rgba(${p.r},${p.g},${p.b},0)`);
          ctx!.fillStyle = glow;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, pulse * 4, 0, Math.PI * 2);
          ctx!.fill();

          // Core dot
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, pulse, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${p.r},${p.g},${p.b},0.9)`;
          ctx!.fill();
        }

      // Mouse cursor node
      if (mx > 0 && mx < w) {
        const mg_glow = ctx!.createRadialGradient(mx, my, 0, mx, my, 20);
        mg_glow.addColorStop(0, `rgba(${mr},${mg},${mb},0.4)`);
        mg_glow.addColorStop(1, `rgba(${mr},${mg},${mb},0)`);
        ctx!.fillStyle = mg_glow;
        ctx!.beginPath();
        ctx!.arc(mx, my, 20, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(mx, my, 3, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${mr},${mg},${mb},0.8)`;
        ctx!.fill();
      }

      if (!paused) animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      if (!preview) {
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", onMouse);
        window.removeEventListener("mouseleave", onLeave);
      }
    };
  }, [colorLeft, colorMiddle, colorRight, showParticles, showConnections]);

  return (
    <canvas
      ref={canvasRef}
      className={`${preview ? "absolute" : "fixed"} pointer-events-none inset-0 z-0 opacity-70`}
    />
  );
});
