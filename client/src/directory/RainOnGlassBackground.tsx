import { useEffect, useRef } from "react";

interface Props {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  paused?: boolean;
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

interface Drop {
  x: number;
  y: number;
  r: number;
  targetR: number;
  state: "growing" | "sitting" | "running";
  sitTimer: number;
  sitMax: number;
  vy: number; // run speed
  trailLen: number; // pixels already run
  trailMaxLen: number;
  wobblePhase: number;
  alpha: number;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function spawn(w: number, h: number): Drop {
  return {
    x: rand(20, w - 20),
    y: rand(20, h - 20),
    r: 0,
    targetR: rand(8, 28),
    state: "growing",
    sitTimer: 0,
    sitMax: rand(1.5, 5),
    vy: 0,
    trailLen: 0,
    trailMaxLen: rand(60, 200),
    wobblePhase: Math.random() * Math.PI * 2,
    alpha: rand(0.55, 0.9),
  };
}

function drawDrop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  alpha: number,
) {
  if (r < 1) return;
  const ry = r * 0.9; // gravity squish

  // Body — semi-transparent, dark-tinted so background shows through
  const body = ctx.createRadialGradient(
    x - r * 0.2,
    y - r * 0.25,
    r * 0.1,
    x,
    y,
    r,
  );
  body.addColorStop(0, `rgba(180,210,240,${alpha * 0.55})`);
  body.addColorStop(0.5, `rgba(140,180,220,${alpha * 0.25})`);
  body.addColorStop(1, `rgba(100,140,180,${alpha * 0.08})`);
  ctx.beginPath();
  ctx.ellipse(x, y, r, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();

  // Dark rim
  ctx.beginPath();
  ctx.ellipse(x, y, r, ry, 0, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(40,60,90,${alpha * 0.55})`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Top-left specular
  const hl = ctx.createRadialGradient(
    x - r * 0.3,
    y - r * 0.35,
    0,
    x - r * 0.1,
    y - r * 0.1,
    r * 0.5,
  );
  hl.addColorStop(0, `rgba(255,255,255,${alpha * 0.9})`);
  hl.addColorStop(0.4, `rgba(255,255,255,${alpha * 0.3})`);
  hl.addColorStop(1, `rgba(255,255,255,0)`);
  ctx.beginPath();
  ctx.ellipse(
    x - r * 0.15,
    y - r * 0.2,
    r * 0.38,
    r * 0.22,
    -0.4,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = hl;
  ctx.fill();

  // Bottom caustic crescent
  ctx.beginPath();
  ctx.ellipse(
    x + r * 0.05,
    y + ry * 0.62,
    r * 0.28,
    r * 0.09,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = `rgba(255,255,255,${alpha * 0.25})`;
  ctx.fill();
}

export function RainOnGlassBackground({
  colorLeft,
  colorMiddle,
  colorRight,
  paused = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasEl = canvas; // capture non-null canvas for inner closures
    const ctx = canvasEl.getContext("2d")!;

    const [lr, lg, lb] = hexToRgb(colorLeft);
    const [mr, mg, mb] = hexToRgb(colorMiddle);
    const [rr, rg, rb] = hexToRgb(colorRight);

    let animId = 0;
    let t = 0;
    const DT = 1 / 60;

    const resize = () => {
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // 45 drops — small enough for smooth 60fps
    const drops: Drop[] = Array.from({ length: 45 }, () =>
      spawn(canvasEl.width, canvasEl.height),
    );
    // pre-age half so screen isn't empty
    drops.slice(0, 22).forEach((d) => {
      d.r = rand(4, d.targetR);
      d.state = "sitting";
      d.sitTimer = rand(0, d.sitMax);
    });

    let spawnCooldown = 0;

    function draw() {
      const w = canvasEl.width;
      const h = canvasEl.height;
      t += DT;

      ctx.clearRect(0, 0, w, h);

      // Condensation tint — one gradient per frame, very cheap
      const tint = ctx.createLinearGradient(0, 0, w, h);
      tint.addColorStop(0, `rgba(${lr},${lg},${lb},0.12)`);
      tint.addColorStop(0.5, `rgba(${mr},${mg},${mb},0.08)`);
      tint.addColorStop(1, `rgba(${rr},${rg},${rb},0.12)`);
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, w, h);

      // Subtle fog patches — 4 static blobs, no per-frame recompute
      ctx.save();
      ctx.globalAlpha = 0.055;
      const blobPositions = [
        [0.2, 0.3],
        [0.75, 0.25],
        [0.5, 0.72],
        [0.88, 0.6],
      ] as const;
      for (const [bx, by] of blobPositions) {
        const g = ctx.createRadialGradient(
          w * bx,
          h * by,
          0,
          w * bx,
          h * by,
          Math.min(w, h) * 0.28,
        );
        g.addColorStop(0, `rgba(${mr},${mg},${mb},1)`);
        g.addColorStop(1, `rgba(${mr},${mg},${mb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();

      // Respawn dead drops
      spawnCooldown -= DT;
      if (spawnCooldown <= 0) {
        const dead = drops.find(
          (d) =>
            d.state === "running" &&
            (d.trailLen >= d.trailMaxLen || d.alpha <= 0),
        );
        if (dead) Object.assign(dead, spawn(w, h));
        spawnCooldown = rand(0.25, 0.7);
      }

      // Update + draw each drop
      for (const d of drops) {
        if (d.state === "growing") {
          d.r = Math.min(d.targetR, d.r + d.targetR * 0.04);
          if (d.r >= d.targetR * 0.98) d.state = "sitting";
          drawDrop(ctx, d.x, d.y, d.r, d.alpha * (d.r / d.targetR));
        } else if (d.state === "sitting") {
          d.sitTimer += DT;
          // Surface tension jiggle — vary r very slightly
          const jiggle = 1 + Math.sin(t * 3 + d.wobblePhase) * 0.015;
          drawDrop(ctx, d.x, d.y, d.r * jiggle, d.alpha);
          if (d.sitTimer >= d.sitMax) {
            d.state = "running";
            d.vy = rand(1.2, 2.5);
          }
        } else {
          // Running — accelerate downward, wobble sideways
          d.vy = Math.min(d.vy + 0.06, 5.5);
          const wx = Math.sin(t * 3.5 + d.wobblePhase) * 0.5;
          d.x += wx;
          d.y += d.vy;
          d.trailLen += d.vy;
          d.alpha -= 0.003;

          // Trail — single tapered stroke behind the bead, very cheap
          if (d.trailLen > 6) {
            const trailTop = Math.max(0, d.y - Math.min(d.trailLen, 120));
            const tg = ctx.createLinearGradient(d.x, trailTop, d.x, d.y);
            tg.addColorStop(0, `rgba(160,200,230,0)`);
            tg.addColorStop(0.4, `rgba(160,200,230,${d.alpha * 0.18})`);
            tg.addColorStop(1, `rgba(200,225,245,${d.alpha * 0.32})`);
            ctx.beginPath();
            ctx.moveTo(d.x, trailTop);
            ctx.lineTo(d.x, d.y);
            ctx.strokeStyle = tg;
            ctx.lineWidth = d.r * 0.9;
            ctx.lineCap = "round";
            ctx.stroke();
          }

          // The running bead — slightly flattened from speed
          drawDrop(ctx, d.x, d.y, d.r * 0.65, Math.max(0, d.alpha));
        }
      }

      if (!paused) animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [colorLeft, colorMiddle, colorRight, paused]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 opacity-90 pointer-events-none"
    />
  );
}
