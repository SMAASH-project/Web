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
  growSpeed: number;
  state: "growing" | "waiting" | "running";
  waitTimer: number;
  waitMax: number;
  trail: Array<{ x: number; y: number; r: number }>;
  runX: number;
  runY: number;
  runSpeed: number;
  wobblePhase: number;
  opacity: number;
}

function makeDrop(w: number, h: number): Drop {
  return {
    x: 30 + Math.random() * (w - 60),
    y: 20 + Math.random() * (h - 40),
    r: 0,
    targetR: 10 + Math.random() * 30,
    growSpeed: 0.6 + Math.random() * 1.2,
    state: "growing",
    waitTimer: 0,
    waitMax: 1.2 + Math.random() * 4.0,
    trail: [],
    runX: 0,
    runY: 0,
    runSpeed: 1.0 + Math.random() * 2.5,
    wobblePhase: Math.random() * Math.PI * 2,
    opacity: 0.75 + Math.random() * 0.25,
  };
}

export function RainOnGlassBackground({
  colorLeft,
  colorMiddle,
  colorRight,
  paused = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Offscreen canvas holds the blurred background — redrawn only on resize/color change
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const [lr, lg, lb] = hexToRgb(colorLeft);
    const [mr, mg, mb] = hexToRgb(colorMiddle);
    const [rr, rg, rb] = hexToRgb(colorRight);

    let animId: number;
    let t = 0;
    const DT = 1 / 60;

    // ── Offscreen background canvas ──────────────────────────────────────────
    const bg = document.createElement("canvas");
    bgCanvasRef.current = bg;

    function buildBackground(w: number, h: number) {
      bg.width = w;
      bg.height = h;
      const bgCtx = bg.getContext("2d")!;

      // Base gradient
      const base = bgCtx.createLinearGradient(0, 0, w, h);
      base.addColorStop(0, `rgb(${lr},${lg},${lb})`);
      base.addColorStop(0.5, `rgb(${mr},${mg},${mb})`);
      base.addColorStop(1, `rgb(${rr},${rg},${rb})`);
      bgCtx.fillStyle = base;
      bgCtx.fillRect(0, 0, w, h);

      // Soft light blobs — these show up "through" the drops as bokeh
      const blobs = [
        { x: w * 0.2, y: h * 0.3, r: h * 0.25, cr: mr, cg: mg, cb: mb },
        { x: w * 0.75, y: h * 0.25, r: h * 0.3, cr: rr, cg: rg, cb: rb },
        { x: w * 0.5, y: h * 0.7, r: h * 0.22, cr: lr, cg: lg, cb: lb },
        { x: w * 0.85, y: h * 0.65, r: h * 0.2, cr: mr, cg: mg, cb: mb },
        { x: w * 0.1, y: h * 0.8, r: h * 0.18, cr: rr, cg: rg, cb: rb },
      ];
      for (const b of blobs) {
        const g = bgCtx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(
          0,
          `rgba(${Math.min(255, b.cr + 80)},${Math.min(255, b.cg + 80)},${Math.min(255, b.cb + 80)},0.8)`,
        );
        g.addColorStop(0.5, `rgba(${b.cr},${b.cg},${b.cb},0.4)`);
        g.addColorStop(1, `rgba(${b.cr},${b.cg},${b.cb},0)`);
        bgCtx.fillStyle = g;
        bgCtx.beginPath();
        bgCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        bgCtx.fill();
      }

      // Frosted glass layer — CSS blur via filter on a copy
      // Instead of expensive per-pixel ops we just overlay a translucent fog
      bgCtx.fillStyle = "rgba(120,140,160,0.18)";
      bgCtx.fillRect(0, 0, w, h);
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildBackground(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Drop pool ─────────────────────────────────────────────────────────────
    const MAX_DROPS = 60;
    const drops: Drop[] = Array.from({ length: MAX_DROPS }, () =>
      makeDrop(canvas.width, canvas.height),
    );
    // Stagger so screen isn't empty at start
    drops.forEach((d, i) => {
      if (i < 35) {
        d.r = 5 + Math.random() * d.targetR;
        d.state = "waiting";
        d.waitTimer = Math.random() * d.waitMax;
      }
    });

    let spawnTimer = 0;

    // ── Draw one drop using refraction trick ──────────────────────────────────
    function drawDrop(
      dx: number,
      dy: number,
      dr: number,
      opacity: number,
      scaleX: number = 1,
    ) {
      if (dr < 1.5) return;

      ctx!.save();

      // Clip to ellipse (drops are slightly squished vertically from gravity)
      const ry = dr * 0.88;
      ctx!.beginPath();
      ctx!.ellipse(dx, dy, dr * scaleX, ry, 0, 0, Math.PI * 2);
      ctx!.clip();

      // ── Refraction: draw background inverted/offset inside the drop ───────
      // A convex lens inverts the image and magnifies it.
      // We simulate this by drawing the bg scaled up and flipped around the drop centre.
      const zoom = 1.6;
      const srcX = dx - dr * zoom;
      const srcY = dy - ry * zoom;
      const srcW = dr * zoom * 2;
      const srcH = ry * zoom * 2;

      ctx!.save();
      // Flip vertically around drop centre to simulate inversion
      ctx!.translate(dx, dy);
      ctx!.scale(1, -1);
      ctx!.translate(-dx, -dy);
      ctx!.globalAlpha = opacity;
      ctx!.drawImage(
        bg,
        srcX,
        srcY,
        srcW,
        srcH,
        dx - dr * scaleX,
        dy - ry,
        dr * scaleX * 2,
        ry * 2,
      );
      ctx!.restore();

      ctx!.restore(); // end clip

      // ── Dark rim — gives the bead depth and separation from background ────
      ctx!.save();
      ctx!.beginPath();
      ctx!.ellipse(dx, dy, dr * scaleX, ry, 0, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(0,0,0,${0.35 * opacity})`;
      ctx!.lineWidth = 1.2;
      ctx!.stroke();

      // Inner light rim at bottom (refracted light exit)
      ctx!.beginPath();
      ctx!.ellipse(
        dx,
        dy + ry * 0.55,
        dr * scaleX * 0.7,
        ry * 0.18,
        0,
        0,
        Math.PI * 2,
      );
      ctx!.strokeStyle = `rgba(255,255,255,${0.2 * opacity})`;
      ctx!.lineWidth = 0.8;
      ctx!.stroke();
      ctx!.restore();

      // ── Specular highlight — top-left bright oval ─────────────────────────
      ctx!.save();
      const hlGrad = ctx!.createRadialGradient(
        dx - dr * scaleX * 0.28,
        dy - ry * 0.32,
        0,
        dx - dr * scaleX * 0.1,
        dy - ry * 0.1,
        dr * scaleX * 0.52,
      );
      hlGrad.addColorStop(0, `rgba(255,255,255,${0.9 * opacity})`);
      hlGrad.addColorStop(0.3, `rgba(255,255,255,${0.45 * opacity})`);
      hlGrad.addColorStop(1, `rgba(255,255,255,0)`);
      ctx!.fillStyle = hlGrad;
      ctx!.beginPath();
      ctx!.ellipse(
        dx - dr * scaleX * 0.12,
        dy - ry * 0.18,
        dr * scaleX * 0.42,
        ry * 0.28,
        -0.3,
        0,
        Math.PI * 2,
      );
      ctx!.fill();
      ctx!.restore();
    }

    // ── Draw run-off trail ────────────────────────────────────────────────────
    function drawTrail(d: Drop) {
      if (d.trail.length < 3) return;
      ctx!.save();

      // Trail body — tapered semi-transparent tube
      for (let i = 1; i < d.trail.length; i++) {
        const a = d.trail[i - 1];
        const b = d.trail[i];
        const progress = i / d.trail.length;
        const trailR = a.r * (1 - progress * 0.6);
        const alpha = (1 - progress) * 0.28 * d.opacity;

        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
        ctx!.strokeStyle = `rgba(160,200,240,${alpha})`;
        ctx!.lineWidth = trailR * 1.6;
        ctx!.lineCap = "round";
        ctx!.stroke();
      }

      // Small bead at tail tip
      if (d.trail.length > 0) {
        const tip = d.trail[d.trail.length - 1];
        const beadR = tip.r * 0.5;
        drawDrop(tip.x, tip.y, beadR, d.opacity * 0.6);
      }

      ctx!.restore();
    }

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      t += DT;

      // ── Base: frosted glass background ────────────────────────────────────
      // Draw bg with slight blur simulation via the fog layer already baked in
      ctx!.clearRect(0, 0, w, h);
      ctx!.drawImage(bg, 0, 0);

      // Condensation haze over everything (very subtle)
      ctx!.fillStyle = "rgba(160,180,200,0.06)";
      ctx!.fillRect(0, 0, w, h);

      // ── Spawn drops ───────────────────────────────────────────────────────
      spawnTimer -= DT;
      if (spawnTimer <= 0) {
        const dead = drops.find(
          (d) =>
            (d.state === "running" && d.runY > h + 40) ||
            (d.state === "running" && d.opacity <= 0),
        );
        if (dead) Object.assign(dead, makeDrop(w, h));
        spawnTimer = 0.2 + Math.random() * 0.5;
      }

      // ── Update and render drops ───────────────────────────────────────────
      for (const d of drops) {
        if (d.state === "growing") {
          d.r = Math.min(d.targetR, d.r + d.growSpeed);
          if (d.r >= d.targetR) {
            d.state = "waiting";
          }
        } else if (d.state === "waiting") {
          d.waitTimer += DT;
          // Gentle jiggle while waiting (surface tension)
          const jiggle = 1 + Math.sin(t * 2.5 + d.wobblePhase) * 0.012;
          drawDrop(d.x, d.y, d.r * jiggle, d.opacity);
          if (d.waitTimer >= d.waitMax) {
            d.state = "running";
            d.runX = d.x;
            d.runY = d.y + d.r;
            d.trail = [{ x: d.x, y: d.y, r: d.r }];
          }
          continue; // already drew above
        } else if (d.state === "running") {
          // Gravity + gentle horizontal wobble (impurity on glass)
          d.runX += Math.sin(t * 3.5 + d.wobblePhase) * 0.3;
          d.runY += d.runSpeed;
          d.runSpeed = Math.min(d.runSpeed + 0.04, 5.5); // accelerate under gravity
          d.trail.push({ x: d.runX, y: d.runY, r: d.r * 0.45 });
          if (d.trail.length > 40) d.trail.shift();
          d.opacity = Math.max(0, d.opacity - 0.004);

          drawTrail(d);
          // Draw flattened running bead at the tip
          drawDrop(d.runX, d.runY, d.r * 0.6, d.opacity, 0.75);
          // Ghost at origin — shrinks away
          if (d.opacity > 0.4) {
            drawDrop(d.x, d.y, d.r * (d.opacity - 0.3), d.opacity * 0.4);
          }
          continue;
        }

        // Growing state — just draw
        drawDrop(d.x, d.y, d.r, d.opacity * (d.r / d.targetR));
      }

      if (!paused) animId = requestAnimationFrame(draw);
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
      className="fixed inset-0 z-0 opacity-90 pointer-events-none"
    />
  );
}
