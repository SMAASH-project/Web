import { useEffect, useRef } from "react";

interface Props {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
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

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wobble: number;
  wobblePhase: number;
}

function makeFish(w: number, h: number, r: number, g: number, b: number): Fish {
  return {
    x: Math.random() * w,
    y: 80 + Math.random() * (h - 180),
    vx: (0.4 + Math.random() * 0.9) * (Math.random() > 0.5 ? 1 : -1),
    baseY: 80 + Math.random() * (h - 180),
    amplitude: 18 + Math.random() * 45,
    frequency: 0.4 + Math.random() * 1.4,
    phase: Math.random() * Math.PI * 2,
    size: 18 + Math.random() * 38,
    r,
    g,
    b,
  };
}

function drawFish(ctx: CanvasRenderingContext2D, f: Fish, t: number) {
  const facing = f.vx > 0 ? 1 : -1;
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.scale(facing, 1);

  const s = f.size;
  const wag = Math.sin(t * 4 + f.phase) * 0.35;

  // Tail
  ctx.beginPath();
  ctx.moveTo(-s * 0.6, 0);
  ctx.lineTo(-s * 1.4, -s * 0.55 + wag * s);
  ctx.lineTo(-s * 1.4, s * 0.55 + wag * s);
  ctx.closePath();
  ctx.fillStyle = `rgba(${f.r},${f.g},${f.b},0.75)`;
  ctx.fill();

  // Body gradient
  const bodyGrad = ctx.createRadialGradient(s * 0.1, -s * 0.1, 0, 0, 0, s);
  bodyGrad.addColorStop(
    0,
    `rgba(${Math.min(255, f.r + 60)},${Math.min(255, f.g + 60)},${Math.min(255, f.b + 60)},0.95)`,
  );
  bodyGrad.addColorStop(1, `rgba(${f.r},${f.g},${f.b},0.8)`);
  ctx.beginPath();
  ctx.ellipse(0, 0, s, s * 0.48, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Dorsal fin
  ctx.beginPath();
  ctx.moveTo(-s * 0.1, -s * 0.42);
  ctx.quadraticCurveTo(s * 0.25, -s * 0.95, s * 0.5, -s * 0.42);
  ctx.closePath();
  ctx.fillStyle = `rgba(${f.r},${f.g},${f.b},0.55)`;
  ctx.fill();

  // Eye
  ctx.beginPath();
  ctx.arc(s * 0.52, -s * 0.1, s * 0.13, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(s * 0.515, -s * 0.115, s * 0.05, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fill();

  ctx.restore();
}

function drawBubble(ctx: CanvasRenderingContext2D, b: Bubble, t: number) {
  const wx = b.x + Math.sin(t * 0.7 + b.wobblePhase) * b.wobble;
  ctx.beginPath();
  ctx.arc(wx, b.y, b.radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    wx - b.radius * 0.28,
    b.y - b.radius * 0.28,
    b.radius * 0.22,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fill();
}

export function FishtankBackground({
  colorLeft,
  colorMiddle,
  colorRight,
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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const [lr, lg, lb] = hexToRgb(colorLeft);
    const [mr, mg, mb] = hexToRgb(colorMiddle);
    const [rr, rg, rb] = hexToRgb(colorRight);

    const fishPalette: Array<[number, number, number]> = [
      [lr, lg, lb],
      [mr, mg, mb],
      [rr, rg, rb],
      [255, 160, 100],
      [100, 220, 255],
      [255, 220, 80],
      [180, 100, 255],
      [100, 255, 160],
    ];

    const fish: Fish[] = Array.from({ length: 9 }, (_, i) => {
      const [r, g, b] = fishPalette[i % fishPalette.length];
      return makeFish(window.innerWidth, window.innerHeight, r, g, b);
    });

    const bubbles: Bubble[] = Array.from({ length: 22 }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * 300,
      radius: 3 + Math.random() * 9,
      speed: 0.45 + Math.random() * 1.3,
      wobble: 15 + Math.random() * 25,
      wobblePhase: Math.random() * Math.PI * 2,
    }));

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      t += 0.016;

      ctx!.clearRect(0, 0, w, h);

      // Caustic light pool at floor
      for (let i = 0; i < 7; i++) {
        const cx =
          ((w * 0.14 * i + t * 28 * (i % 2 === 0 ? 1 : -0.7)) % (w + 120)) - 60;
        const cy = h - 55 + Math.sin(t * 0.9 + i * 1.3) * 18;
        const rad = 70 + Math.sin(t * 0.6 + i) * 22;
        const caustic = ctx!.createRadialGradient(cx, cy, 0, cx, cy, rad);
        caustic.addColorStop(0, "rgba(255,255,200,0.13)");
        caustic.addColorStop(1, "rgba(255,255,200,0)");
        ctx!.fillStyle = caustic;
        ctx!.fillRect(0, h - 130, w, 130);
      }

      // Light shafts from surface
      for (let i = 0; i < 5; i++) {
        const rx = w * 0.16 * i + 40 + Math.sin(t * 0.25 + i * 1.7) * 50;
        ctx!.save();
        ctx!.globalAlpha = 0.032 + Math.sin(t * 0.4 + i) * 0.012;
        ctx!.beginPath();
        ctx!.moveTo(rx - 15, 0);
        ctx!.lineTo(rx - 55, h);
        ctx!.lineTo(rx + 55, h);
        ctx!.lineTo(rx + 15, 0);
        ctx!.closePath();
        ctx!.fillStyle = "rgba(255,255,255,1)";
        ctx!.fill();
        ctx!.restore();
      }

      // Bubbles
      for (const b of bubbles) {
        b.y -= b.speed;
        if (b.y < -b.radius * 2) {
          b.y = h + 20;
          b.x = Math.random() * w;
        }
        drawBubble(ctx!, b, t);
      }

      // Fish
      for (const f of fish) {
        f.x += f.vx;
        f.y = f.baseY + Math.sin(t * f.frequency + f.phase) * f.amplitude;
        const margin = f.size * 2.5;
        if (f.x > w + margin) f.x = -margin;
        if (f.x < -margin) f.x = w + margin;
        drawFish(ctx!, f, t);
      }

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [colorLeft, colorMiddle, colorRight]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 opacity-55 pointer-events-none"
    />
  );
}
