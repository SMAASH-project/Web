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
  r: number; // radius
  life: number; // 0 = just born, 1 = fully grown
  growSpeed: number;
  state: "growing" | "waiting" | "running";
  waitTimer: number;
  waitMax: number;
  // Run-off trail
  trail: Array<{ x: number; y: number }>;
  runSpeed: number;
  runX: number;
  runY: number;
  wobblePhase: number;
  opacity: number;
}

function makeDrop(w: number, h: number): Drop {
  return {
    x: Math.random() * w,
    y: Math.random() * h * 0.85 + 20,
    r: 0,
    life: 0,
    growSpeed: 0.008 + Math.random() * 0.018,
    state: "growing",
    waitTimer: 0,
    waitMax: 0.8 + Math.random() * 3.0,
    trail: [],
    runSpeed: 1.2 + Math.random() * 2.2,
    runX: 0,
    runY: 0,
    wobblePhase: Math.random() * Math.PI * 2,
    opacity: 0.5 + Math.random() * 0.5,
  };
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
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const [lr, lg, lb] = hexToRgb(colorLeft);
    const [mr, mg, mb] = hexToRgb(colorMiddle);
    const [rr, rg, rb] = hexToRgb(colorRight);

    let animId: number;
    let t = 0;
    const DT = 1 / 60;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Drop pool ────────────────────────────────────────────────────────────
    const MAX_DROPS = 55;
    const drops: Drop[] = Array.from({ length: MAX_DROPS }, () =>
      makeDrop(canvas.width, canvas.height),
    );
    // Stagger initial state so they don't all appear at once
    drops.forEach((d) => {
      d.life = Math.random();
      if (d.life > 0.5) {
        d.state = "waiting";
        d.r = 8 + Math.random() * 18;
        d.waitTimer = Math.random() * d.waitMax;
      }
    });

    let spawnTimer = 0;
    const SPAWN_INTERVAL = 0.18;

    // ── Draw a single drop on the glass surface ───────────────────────────
    function drawDrop(d: Drop) {
      const w = canvas!.width;
      const h = canvas!.height;
      if (d.r < 1) return;

      ctx!.save();

      // Frosted lens — the key "rain on glass" effect
      // Slightly lighter circle that distorts what's behind
      const lensGrad = ctx!.createRadialGradient(
        d.x - d.r * 0.25,
        d.y - d.r * 0.3,
        0,
        d.x,
        d.y,
        d.r,
      );
      lensGrad.addColorStop(0, `rgba(255,255,255,${0.22 * d.opacity})`);
      lensGrad.addColorStop(0.4, `rgba(200,230,255,${0.14 * d.opacity})`);
      lensGrad.addColorStop(0.85, `rgba(150,200,255,${0.06 * d.opacity})`);
      lensGrad.addColorStop(1, `rgba(100,160,220,0)`);

      ctx!.beginPath();
      ctx!.ellipse(d.x, d.y, d.r, d.r * 0.85, 0, 0, Math.PI * 2);
      ctx!.fillStyle = lensGrad;
      ctx!.fill();

      // Edge ring — thin dark border gives glass bead depth
      ctx!.beginPath();
      ctx!.ellipse(d.x, d.y, d.r, d.r * 0.85, 0, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(80,130,180,${0.25 * d.opacity})`;
      ctx!.lineWidth = 0.8;
      ctx!.stroke();

      // Specular highlight — top-left bright arc
      const hlGrad = ctx!.createRadialGradient(
        d.x - d.r * 0.3,
        d.y - d.r * 0.35,
        0,
        d.x - d.r * 0.1,
        d.y - d.r * 0.15,
        d.r * 0.55,
      );
      hlGrad.addColorStop(0, `rgba(255,255,255,${0.75 * d.opacity})`);
      hlGrad.addColorStop(0.5, `rgba(255,255,255,${0.2 * d.opacity})`);
      hlGrad.addColorStop(1, `rgba(255,255,255,0)`);
      ctx!.beginPath();
      ctx!.ellipse(
        d.x - d.r * 0.1,
        d.y - d.r * 0.15,
        d.r * 0.45,
        d.r * 0.3,
        -0.4,
        0,
        Math.PI * 2,
      );
      ctx!.fillStyle = hlGrad;
      ctx!.fill();

      // Bottom caustic — small bright crescent at base
      ctx!.beginPath();
      ctx!.ellipse(
        d.x + d.r * 0.1,
        d.y + d.r * 0.5,
        d.r * 0.3,
        d.r * 0.12,
        0.2,
        0,
        Math.PI * 2,
      );
      ctx!.fillStyle = `rgba(255,255,255,${0.18 * d.opacity})`;
      ctx!.fill();

      ctx!.restore();
    }

    // ── Draw run-off trail ────────────────────────────────────────────────
    function drawTrail(d: Drop) {
      if (d.trail.length < 2) return;
      ctx!.save();

      for (let i = 1; i < d.trail.length; i++) {
        const a = d.trail[i - 1];
        const b = d.trail[i];
        const progress = i / d.trail.length;
        const alpha = (1 - progress) * 0.3 * d.opacity;
        const width = d.r * 0.45 * (1 - progress * 0.5);

        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
        ctx!.strokeStyle = `rgba(180,215,255,${alpha})`;
        ctx!.lineWidth = width;
        ctx!.lineCap = "round";
        ctx!.stroke();
      }

      // Draw current run-off bead at tip
      if (d.trail.length > 0) {
        const tip = d.trail[d.trail.length - 1];
        const beadR = d.r * 0.55;
        const beadGrad = ctx!.createRadialGradient(
          tip.x - beadR * 0.2,
          tip.y - beadR * 0.2,
          0,
          tip.x,
          tip.y,
          beadR,
        );
        beadGrad.addColorStop(0, `rgba(255,255,255,${0.5 * d.opacity})`);
        beadGrad.addColorStop(0.5, `rgba(180,220,255,${0.2 * d.opacity})`);
        beadGrad.addColorStop(1, `rgba(120,180,220,0)`);
        ctx!.beginPath();
        ctx!.arc(tip.x, tip.y, beadR, 0, Math.PI * 2);
        ctx!.fillStyle = beadGrad;
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(tip.x, tip.y, beadR, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(100,160,210,${0.2 * d.opacity})`;
        ctx!.lineWidth = 0.6;
        ctx!.stroke();
      }

      ctx!.restore();
    }

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      t += DT;

      ctx!.clearRect(0, 0, w, h);

      // ── Condensation fog layer — very subtle, gives glass texture ─────────
      ctx!.save();
      ctx!.globalAlpha = 0.04;
      // Slow-moving fog patches
      for (let i = 0; i < 6; i++) {
        const fx = (w * 0.18 * i + Math.sin(t * 0.08 + i) * 40 + w) % w;
        const fy = (h * 0.2 * i + Math.cos(t * 0.06 + i * 1.3) * 30 + h) % h;
        const fog = ctx!.createRadialGradient(
          fx,
          fy,
          0,
          fx,
          fy,
          180 + Math.sin(t * 0.1 + i) * 40,
        );
        fog.addColorStop(0, `rgba(${mr},${mg},${mb},0.6)`);
        fog.addColorStop(1, `rgba(${mr},${mg},${mb},0)`);
        ctx!.fillStyle = fog;
        ctx!.fillRect(0, 0, w, h);
      }
      ctx!.restore();

      // ── Ambient tint ──────────────────────────────────────────────────────
      const tint = ctx!.createLinearGradient(0, 0, w, h);
      tint.addColorStop(0, `rgba(${lr},${lg},${lb},0.08)`);
      tint.addColorStop(0.5, `rgba(${mr},${mg},${mb},0.05)`);
      tint.addColorStop(1, `rgba(${rr},${rg},${rb},0.08)`);
      ctx!.fillStyle = tint;
      ctx!.fillRect(0, 0, w, h);

      // ── Spawn new drops ───────────────────────────────────────────────────
      spawnTimer -= DT;
      if (spawnTimer <= 0) {
        const dead = drops.find(
          (d) => d.state === "running" && d.runY > h + 20,
        );
        if (dead) Object.assign(dead, makeDrop(w, h));
        spawnTimer = SPAWN_INTERVAL + Math.random() * 0.3;
      }

      // ── Update and draw drops ─────────────────────────────────────────────
      for (const d of drops) {
        if (d.state === "growing") {
          d.life += d.growSpeed;
          d.r = Math.min(
            8 + Math.random() * 0.5,
            d.life * (14 + Math.random() * 14),
          );
          if (d.life >= 1) {
            d.state = "waiting";
            d.r = 8 + Math.random() * 18;
          }
        } else if (d.state === "waiting") {
          d.waitTimer += DT;
          // Slight jiggle while waiting
          d.r += Math.sin(t * 3 + d.wobblePhase) * 0.02;
          if (d.waitTimer >= d.waitMax) {
            d.state = "running";
            d.runX = d.x;
            d.runY = d.y + d.r;
            d.trail = [{ x: d.x, y: d.y }];
          }
        } else if (d.state === "running") {
          // Gravity + slight horizontal wobble
          const wobble = Math.sin(t * 4 + d.wobblePhase) * 0.4;
          d.runX += wobble;
          d.runY += d.runSpeed;
          d.trail.push({ x: d.runX, y: d.runY });
          // Fade out and trim trail
          if (d.trail.length > 60) d.trail.shift();
          d.opacity = Math.max(0, d.opacity - 0.003);
        }

        drawTrail(d);
        if (d.state !== "running") drawDrop(d);
        else {
          // Draw smaller bead at origin while running
          const ghost: Drop = { ...d, r: d.r * 0.4, opacity: d.opacity * 0.3 };
          drawDrop(ghost);
        }
      }

      // ── Subtle vertical streaks at edges — condensation runs ─────────────
      ctx!.save();
      ctx!.globalAlpha = 0.04;
      for (let i = 0; i < 4; i++) {
        const sx = (i * w * 0.28 + t * 6) % w;
        const sg = ctx!.createLinearGradient(sx, 0, sx, h);
        sg.addColorStop(0, "rgba(200,230,255,0)");
        sg.addColorStop(0.3, `rgba(200,230,255,0.8)`);
        sg.addColorStop(1, "rgba(200,230,255,0)");
        ctx!.strokeStyle = sg;
        ctx!.lineWidth = 0.5;
        ctx!.beginPath();
        ctx!.moveTo(sx, 0);
        ctx!.lineTo(sx + Math.sin(t * 0.2 + i) * 8, h);
        ctx!.stroke();
      }
      ctx!.restore();

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
      className="fixed inset-0 z-0 opacity-85 pointer-events-none"
    />
  );
}
