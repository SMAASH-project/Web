import { memo, useEffect, useRef } from "react";

interface Props {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  paused?: boolean;
  preview?: boolean;
  showFish?: boolean;
  showBubbles?: boolean;
  showSeaweed?: boolean;
  showCaustics?: boolean;
  showLightShafts?: boolean;
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

// ─── Fish ─────────────────────────────────────────────────────────────────────

interface Fish {
  x: number;
  y: number;
  vx: number;
  baseY: number;
  amplitude: number;
  frequency: number;
  phase: number;
  size: number;
  r: number;
  g: number;
  b: number;
}

function makeFish(w: number, h: number, r: number, g: number, b: number): Fish {
  const margin = 0.15;
  return {
    x: Math.random() * w,
    y: h * margin + Math.random() * h * (1 - margin * 2),
    vx: (0.6 + Math.random() * 1.2) * (Math.random() > 0.5 ? 1 : -1),
    baseY: h * margin + Math.random() * h * (1 - margin * 2),
    amplitude: 15 + Math.random() * 45,
    frequency: 0.5 + Math.random() * 1.0,
    phase: Math.random() * Math.PI * 2,
    size: 18 + Math.random() * 36,
    r,
    g,
    b,
  };
}

function drawFish(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  vx: number,
  size: number,
  r: number,
  g: number,
  b: number,
  t: number,
  phase: number,
  alpha: number = 1,
) {
  const facing = vx >= 0 ? 1 : -1;
  const s = size;
  const wag = Math.sin(t * 5 + phase) * 0.3;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ctx.globalAlpha = alpha;

  // Tail — forked
  ctx.beginPath();
  ctx.moveTo(-s * 0.55, 0);
  ctx.lineTo(-s * 1.35, -s * 0.5 + wag * s * 0.8);
  ctx.lineTo(-s * 0.9, 0);
  ctx.lineTo(-s * 1.35, s * 0.5 + wag * s * 0.8);
  ctx.closePath();
  ctx.fillStyle = `rgba(${r},${g},${b},0.7)`;
  ctx.fill();

  // Body gradient — belly lighter
  const bodyGrad = ctx.createLinearGradient(0, -s * 0.45, 0, s * 0.45);
  bodyGrad.addColorStop(
    0,
    `rgba(${Math.min(255, r + 50)},${Math.min(255, g + 50)},${Math.min(255, b + 50)},0.9)`,
  );
  bodyGrad.addColorStop(0.4, `rgba(${r},${g},${b},0.95)`);
  bodyGrad.addColorStop(
    1,
    `rgba(${Math.min(255, r + 70)},${Math.min(255, g + 70)},${Math.min(255, b + 70)},0.85)`,
  );
  ctx.beginPath();
  ctx.ellipse(0, 0, s, s * 0.4, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Iridescent sheen
  const sheenGrad = ctx.createLinearGradient(-s * 0.3, -s * 0.4, s * 0.3, s * 0.4);
  sheenGrad.addColorStop(0, `rgba(255,255,255,0.18)`);
  sheenGrad.addColorStop(0.5, `rgba(255,255,255,0.04)`);
  sheenGrad.addColorStop(1, `rgba(255,255,255,0.12)`);
  ctx.beginPath();
  ctx.ellipse(0, 0, s, s * 0.4, 0, 0, Math.PI * 2);
  ctx.fillStyle = sheenGrad;
  ctx.fill();

  // Dorsal fin
  ctx.beginPath();
  ctx.moveTo(-s * 0.15, -s * 0.38);
  ctx.quadraticCurveTo(s * 0.2, -s * 0.85 + wag * s * 0.15, s * 0.45, -s * 0.38);
  ctx.closePath();
  ctx.fillStyle = `rgba(${r},${g},${b},0.5)`;
  ctx.fill();

  // Pectoral fin
  ctx.beginPath();
  ctx.moveTo(s * 0.05, s * 0.08);
  ctx.quadraticCurveTo(s * 0.35, s * 0.65 + wag * s * 0.2, s * 0.18, s * 0.42);
  ctx.closePath();
  ctx.fillStyle = `rgba(${r},${g},${b},0.4)`;
  ctx.fill();

  // Scale line suggestion
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 0, s, s * 0.4, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = "rgba(0,0,0,1)";
  ctx.lineWidth = 0.8;
  for (let i = -1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(-s * 0.6 + i * s * 0.42, 0, s * 0.38, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Eye
  ctx.beginPath();
  ctx.arc(s * 0.5, -s * 0.07, s * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(10,10,20,0.95)";
  ctx.fill();
  // Iris
  ctx.beginPath();
  ctx.arc(s * 0.5, -s * 0.07, s * 0.07, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${Math.min(255, r + 40)},${Math.min(255, g + 20)},${Math.min(255, b + 60)},0.8)`;
  ctx.fill();
  // Specular
  ctx.beginPath();
  ctx.arc(s * 0.485, -s * 0.1, s * 0.04, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fill();

  ctx.restore();
}

// ─── Bubble ───────────────────────────────────────────────────────────────────

interface Bubble {
  x: number;
  y: number;
  r: number;
  speed: number;
  wobble: number;
  phase: number;
}

function drawBubble(ctx: CanvasRenderingContext2D, b: Bubble, t: number) {
  const wx = b.x + Math.sin(t * 0.9 + b.phase) * b.wobble;

  // Outer rim
  ctx.beginPath();
  ctx.arc(wx, b.y, b.r, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(200,230,255,0.35)`;
  ctx.lineWidth = 0.9;
  ctx.stroke();

  // Fill — very subtle
  ctx.beginPath();
  ctx.arc(wx, b.y, b.r, 0, Math.PI * 2);
  const fill = ctx.createRadialGradient(wx, b.y, 0, wx, b.y, b.r);
  fill.addColorStop(0, "rgba(200,230,255,0.06)");
  fill.addColorStop(1, "rgba(200,230,255,0)");
  ctx.fillStyle = fill;
  ctx.fill();

  // Specular
  ctx.beginPath();
  ctx.arc(wx - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fill();
}

// ─── Seaweed silhouette ────────────────────────────────────────────────────────

interface Weed {
  x: number;
  h: number;
  segs: number;
  phase: number;
  dark: number;
}

function drawWeed(ctx: CanvasRenderingContext2D, w: Weed, t: number, floorY: number) {
  const segH = w.h / w.segs;
  ctx.save();
  ctx.strokeStyle = `rgba(20,${50 + w.dark},30,0.7)`;
  ctx.lineWidth = 3 + w.dark * 0.05;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  let cx = w.x,
    cy = floorY;
  ctx.moveTo(cx, cy);
  for (let i = 0; i < w.segs; i++) {
    const sway = Math.sin(t * 0.6 + w.phase + i * 0.5) * (4 + i * 2.5);
    cx = w.x + sway;
    cy = floorY - segH * (i + 1);
    ctx.lineTo(cx, cy);
  }
  ctx.stroke();
  ctx.restore();
}

// ─── School ───────────────────────────────────────────────────────────────────

interface SchoolMember {
  dx: number;
  dy: number;
  phase: number;
  size: number;
}
interface School {
  x: number;
  y: number;
  vx: number;
  vy: number;
  members: SchoolMember[];
  r: number;
  g: number;
  b: number;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export const FishtankBackground = memo(function FishtankBackground({
  colorLeft,
  colorMiddle,
  colorRight,
  paused = false,
  preview = false,
  showFish = true,
  showBubbles = true,
  showSeaweed = true,
  showCaustics = true,
  showLightShafts = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = preview ? (canvas.parentElement?.offsetWidth ?? 320) : window.innerWidth;
      canvas.height = preview ? (canvas.parentElement?.offsetHeight ?? 200) : window.innerHeight;
    };
    resize();
    if (!preview) window.addEventListener("resize", resize);

    const [lr, lg, lb] = hexToRgb(colorLeft);
    const [mr, mg, mb] = hexToRgb(colorMiddle);
    const [rr, rg, rb] = hexToRgb(colorRight);

    // Palette: mix theme colors with vivid fish colors
    const palette: Array<[number, number, number]> = [
      [lr, lg, lb],
      [mr, mg, mb],
      [rr, rg, rb],
      [255, 130, 60], // clownfish orange
      [60, 200, 255], // tropical blue
      [255, 210, 50], // yellow tang
      [180, 70, 255], // purple
      [60, 255, 140], // green
      [255, 80, 140], // pink
    ];

    const fish: Fish[] = Array.from({ length: 8 }, (_, i) => {
      const [r, g, b] = palette[i % palette.length];
      return makeFish(canvas.width, canvas.height, r, g, b);
    });

    // Two schools
    const schools: School[] = Array.from({ length: 2 }, (_, i) => {
      const [r, g, b] = palette[(i + 3) % palette.length];
      return {
        x: Math.random() * canvas.width,
        y: 80 + Math.random() * (canvas.height - 200),
        vx: (1.0 + Math.random() * 0.8) * (Math.random() > 0.5 ? 1 : -1),
        vy: (Math.random() - 0.5) * 0.3,
        r,
        g,
        b,
        members: Array.from({ length: 10 + Math.floor(Math.random() * 8) }, () => ({
          dx: (Math.random() - 0.5) * 70,
          dy: (Math.random() - 0.5) * 35,
          phase: Math.random() * Math.PI * 2,
          size: 6 + Math.random() * 7,
        })),
      };
    });

    const bubbles: Bubble[] = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * canvas.height * 0.5,
      r: 2 + Math.random() * 8,
      speed: 0.4 + Math.random() * 1.1,
      wobble: 10 + Math.random() * 20,
      phase: Math.random() * Math.PI * 2,
    }));

    // Seaweed — only a few at the very bottom edges, darker
    const weeds: Weed[] = Array.from({ length: 14 }, (_, i) => ({
      x: (i * canvas.width) / 13 + (Math.random() - 0.5) * 50,
      h: 40 + Math.random() * 80,
      segs: 4 + Math.floor(Math.random() * 4),
      phase: Math.random() * Math.PI * 2,
      dark: 20 + Math.floor(Math.random() * 60),
    }));

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      t += 0.016;

      ctx!.clearRect(0, 0, w, h);

      // ── Deep water gradient — dark bottom, lighter near surface ─────────
      const water = ctx!.createLinearGradient(0, 0, 0, h);
      water.addColorStop(
        0,
        `rgba(${Math.round(lr * 0.4)},${Math.round(lg * 0.4)},${Math.round(lb * 0.6)},0.5)`,
      );
      water.addColorStop(
        0.5,
        `rgba(${Math.round(mr * 0.2)},${Math.round(mg * 0.2)},${Math.round(mb * 0.3)},0.3)`,
      );
      water.addColorStop(1, "rgba(0,5,15,0.7)");
      ctx!.fillStyle = water;
      ctx!.fillRect(0, 0, w, h);

      // ── Caustic light patterns on upper half ─────────────────────────────
      if (showCaustics) {
        ctx!.save();
        ctx!.globalAlpha = 0.07;
        for (let i = 0; i < 7; i++) {
          const cx = ((i * w * 0.16 + t * 18 * (i % 2 === 0 ? 1 : -0.7)) % (w + 80)) - 40;
          const cy = h * 0.12 + Math.sin(t * 0.8 + i * 1.1) * h * 0.06;
          const crad = 80 + Math.sin(t * 0.5 + i) * 25;
          const caust = ctx!.createRadialGradient(cx, cy, 0, cx, cy, crad);
          caust.addColorStop(0, `rgba(${mr},${mg},${mb},0.9)`);
          caust.addColorStop(0.6, `rgba(${mr},${mg},${mb},0.3)`);
          caust.addColorStop(1, "rgba(0,0,0,0)");
          ctx!.fillStyle = caust;
          ctx!.fillRect(0, 0, w, h * 0.4);
        }
        ctx!.restore();
      }

      // ── Light shafts from surface ─────────────────────────────────────────
      if (showLightShafts) {
        for (let i = 0; i < 5; i++) {
          const rx = w * 0.17 * i + 60 + Math.sin(t * 0.2 + i * 2.1) * 40;
          const shaftAlpha = 0.022 + Math.sin(t * 0.3 + i) * 0.008;
          const shaft = ctx!.createLinearGradient(rx, 0, rx, h * 0.7);
          shaft.addColorStop(0, `rgba(${mr},${mg},${mb},${shaftAlpha * 4})`);
          shaft.addColorStop(0.4, `rgba(${mr},${mg},${mb},${shaftAlpha})`);
          shaft.addColorStop(1, "rgba(0,0,0,0)");
          ctx!.save();
          ctx!.globalAlpha = 1;
          ctx!.beginPath();
          ctx!.moveTo(rx - 10, 0);
          ctx!.lineTo(rx - 50, h * 0.7);
          ctx!.lineTo(rx + 50, h * 0.7);
          ctx!.lineTo(rx + 10, 0);
          ctx!.closePath();
          ctx!.fillStyle = shaft;
          ctx!.fill();
          ctx!.restore();
        }

        // ── Surface ripple shimmer ──────────────────────────────────────────
        ctx!.save();
        ctx!.globalAlpha = 0.06;
        for (let i = 0; i < 10; i++) {
          const sx = ((i * w * 0.11 + t * 28 * (i % 2 === 0 ? 1 : -1)) % (w + 60)) - 30;
          const sw = 20 + Math.sin(t * 0.5 + i) * 10;
          const sg = ctx!.createLinearGradient(sx - sw, 2, sx + sw, 2);
          sg.addColorStop(0, "rgba(255,255,255,0)");
          sg.addColorStop(0.5, `rgba(${mr},${mg},${mb},1)`);
          sg.addColorStop(1, "rgba(255,255,255,0)");
          ctx!.fillStyle = sg;
          ctx!.fillRect(sx - sw, 0, sw * 2, 5);
        }
        ctx!.restore();
      }

      // ── Seaweed silhouettes at the very bottom ────────────────────────────
      const FLOOR = h;
      if (showSeaweed) {
        for (const w2 of weeds) {
          drawWeed(ctx!, w2, t, FLOOR);
        }
      }

      // ── Deep vignette at bottom — hides weed roots cleanly ───────────────
      const vignette = ctx!.createLinearGradient(0, h * 0.82, 0, h);
      vignette.addColorStop(0, "rgba(0,4,12,0)");
      vignette.addColorStop(1, "rgba(0,4,12,0.85)");
      ctx!.fillStyle = vignette;
      ctx!.fillRect(0, h * 0.82, w, h * 0.18);

      // ── Bubbles ───────────────────────────────────────────────────────────
      if (showBubbles) {
        for (const b of bubbles) {
          b.y -= b.speed;
          if (b.y < -b.r * 2) {
            b.y = h + 10;
            b.x = Math.random() * w;
          }
          drawBubble(ctx!, b, t);
        }
      }

      // ── Schools + Solo fish ───────────────────────────────────────────────
      if (showFish) {
        for (const sc of schools) {
          sc.x += sc.vx;
          sc.vy += (Math.random() - 0.5) * 0.015;
          sc.vy *= 0.98;
          sc.y = Math.max(60, Math.min(h - 160, sc.y + sc.vy));
          if (sc.x > w + 120) sc.x = -120;
          if (sc.x < -120) sc.x = w + 120;

          for (const m of sc.members) {
            const fx = sc.x + m.dx + Math.sin(t * 1.8 + m.phase) * 5;
            const fy = sc.y + m.dy + Math.cos(t * 1.4 + m.phase) * 3;
            drawFish(ctx!, fx, fy, sc.vx, m.size, sc.r, sc.g, sc.b, t, m.phase, 0.72);
          }
        }

        for (const f of fish) {
          f.x += f.vx;
          f.y = f.baseY + Math.sin(t * f.frequency + f.phase) * f.amplitude;
          const margin = f.size * 2;
          if (f.x > w + margin) f.x = -margin;
          if (f.x < -margin) f.x = w + margin;
          f.baseY = Math.max(h * 0.1, Math.min(h * 0.85, f.baseY));
          drawFish(ctx!, f.x, f.y, f.vx, f.size, f.r, f.g, f.b, t, f.phase);
        }
      }

      if (!paused) animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      if (!preview) window.removeEventListener("resize", resize);
    };
  }, [
    colorLeft,
    colorMiddle,
    colorRight,
    showFish,
    showBubbles,
    showSeaweed,
    showCaustics,
    showLightShafts,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`${preview ? "absolute" : "fixed"} pointer-events-none inset-0 z-0 opacity-60`}
    />
  );
});
