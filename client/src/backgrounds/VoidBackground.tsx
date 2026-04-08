import { memo, useEffect, useRef } from "react";

interface Props {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  paused?: boolean;
  preview?: boolean;
  showDepthBlobs?: boolean;
  showJellyfish?: boolean;
  showAmbientOrbs?: boolean;
  showMarineSnow?: boolean;
}

// Deep-sea bioluminescent palette
const PALETTE: [number, number, number][] = [
  [0, 220, 180], // teal
  [0, 180, 255], // electric blue
  [0, 255, 140], // sea green
  [80, 140, 255], // indigo blue
  [0, 200, 220], // cyan
  [40, 255, 180], // mint
  [120, 80, 255], // violet
];

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  pulseSpeed: number;
  r: number;
  g: number;
  b: number;
}

interface Tentacle {
  offsetX: number; // fraction of bellR, spread across bottom edge
  length: number;
  swayAmp: number;
  swaySpeed: number;
  phaseOffset: number;
}

interface Jellyfish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bellR: number;
  squash: number; // vertical scale of bell dome
  phase: number;
  pulseSpeed: number;
  tentacles: Tentacle[];
  r: number;
  g: number;
  b: number;
  baseAlpha: number;
  flashAge: number; // -1 = idle; >=0 = seconds elapsed since flash started
  flashTimer: number; // seconds until next flash triggers
}

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  pulseSpeed: number;
  r: number;
  g: number;
  b: number;
}

interface Snowflake {
  x: number;
  y: number;
  vy: number;
  alpha: number;
  radius: number;
  swayOffset: number;
}

function makeTentacles(count: number): Tentacle[] {
  return Array.from({ length: count }, (_, i) => ({
    offsetX: count > 1 ? -0.82 + (i / (count - 1)) * 1.64 : 0,
    length: 30 + Math.random() * 45,
    swayAmp: 8 + Math.random() * 18,
    swaySpeed: 0.4 + Math.random() * 0.9,
    phaseOffset: Math.random() * Math.PI * 2,
  }));
}

export const VoidBackground = memo(function VoidBackground({
  paused = false,
  preview = false,
  showDepthBlobs = true,
  showJellyfish = true,
  showAmbientOrbs = true,
  showMarineSnow = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const timeRef = useRef(0);

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
    timeRef.current = 0;

    const resize = () => {
      canvas.width = preview ? (canvas.parentElement?.offsetWidth ?? 320) : window.innerWidth;
      canvas.height = preview ? (canvas.parentElement?.offsetHeight ?? 200) : window.innerHeight;
    };
    resize();
    if (!preview) window.addEventListener("resize", resize);

    // Background depth blobs (3) — pure radial glow, no silhouette
    const blobs: Blob[] = Array.from({ length: 3 }, (_, i) => {
      const [r, g, b] = PALETTE[i % PALETTE.length];
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.06,
        radius: 120 + Math.random() * 100,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.15 + Math.random() * 0.2,
        r,
        g,
        b,
      };
    });

    // Foreground jellyfish (4) — bell silhouette + tentacles
    const jellies: Jellyfish[] = Array.from({ length: 4 }, (_, i) => {
      const [r, g, b] = PALETTE[(i + 1) % PALETTE.length];
      return {
        x: (0.15 + i * 0.22) * window.innerWidth,
        y: (0.25 + Math.random() * 0.55) * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(0.15 + Math.random() * 0.2), // drift upward
        bellR: 22 + Math.random() * 22,
        squash: 0.45 + Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.5 + Math.random() * 0.6,
        tentacles: makeTentacles(5 + (i % 3)),
        r,
        g,
        b,
        baseAlpha: 0.55 + Math.random() * 0.3,
        flashAge: -1,
        flashTimer: 8 + Math.random() * 10 + i * 3, // stagger initial flashes
      };
    });

    // Ambient orbs (12) — scattered background glow dots
    const orbs: Orb[] = Array.from({ length: 12 }, (_, i) => {
      const [r, g, b] = PALETTE[i % PALETTE.length];
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.1,
        radius: 6 + Math.random() * 18,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.4 + Math.random() * 0.7,
        r,
        g,
        b,
      };
    });

    // Marine snow (70 flakes drifting downward)
    const snow: Snowflake[] = Array.from({ length: 70 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vy: 0.3 + Math.random() * 0.5,
      alpha: 0.04 + Math.random() * 0.1,
      radius: 0.5 + Math.random() * 1.0,
      swayOffset: Math.random() * Math.PI * 2,
    }));

    function renderFrame(dt: number) {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      const t = timeRef.current;

      ctx.clearRect(0, 0, w, h);

      // --- Background depth blobs ---
      if (showDepthBlobs) {
        for (const bl of blobs) {
          bl.phase += bl.pulseSpeed * dt;
          const pulse = 0.5 + 0.5 * Math.sin(bl.phase);
          const alpha = 0.025 + pulse * 0.065;
          const grad = ctx.createRadialGradient(bl.x, bl.y, 0, bl.x, bl.y, bl.radius);
          grad.addColorStop(0, `rgba(${bl.r},${bl.g},${bl.b},${alpha.toFixed(3)})`);
          grad.addColorStop(0.5, `rgba(${bl.r},${bl.g},${bl.b},${(alpha * 0.4).toFixed(3)})`);
          grad.addColorStop(1, `rgba(${bl.r},${bl.g},${bl.b},0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(bl.x, bl.y, bl.radius, 0, Math.PI * 2);
          ctx.fill();
          bl.x += bl.vx;
          bl.y += bl.vy;
          if (bl.x < -bl.radius) bl.x = w + bl.radius;
          else if (bl.x > w + bl.radius) bl.x = -bl.radius;
          if (bl.y < -bl.radius) bl.y = h + bl.radius;
          else if (bl.y > h + bl.radius) bl.y = -bl.radius;
        }
      }

      // --- Ambient orbs ---
      if (showAmbientOrbs) {
        for (const orb of orbs) {
          orb.phase += orb.pulseSpeed * dt;
          const pulse = 0.5 + 0.5 * Math.sin(orb.phase);
          const alpha = 0.05 + pulse * 0.15;
          const gr = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius * 2.5);
          gr.addColorStop(0, `rgba(${orb.r},${orb.g},${orb.b},${(alpha * 0.9).toFixed(3)})`);
          gr.addColorStop(0.4, `rgba(${orb.r},${orb.g},${orb.b},${(alpha * 0.35).toFixed(3)})`);
          gr.addColorStop(1, `rgba(${orb.r},${orb.g},${orb.b},0)`);
          ctx.fillStyle = gr;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.radius * 2.5, 0, Math.PI * 2);
          ctx.fill();
          orb.x += orb.vx;
          orb.y += orb.vy;
          const pad = orb.radius * 3;
          if (orb.x < -pad) orb.x = w + pad;
          else if (orb.x > w + pad) orb.x = -pad;
          if (orb.y < -pad) orb.y = h + pad;
          else if (orb.y > h + pad) orb.y = -pad;
        }
      }

      // --- Marine snow ---
      if (showMarineSnow) {
        for (const flake of snow) {
          flake.x += Math.sin(t * 0.4 + flake.swayOffset) * 0.25;
          flake.y += flake.vy;
          if (flake.y > h + 5) flake.y = -5;
          if (flake.x < -5) flake.x = w + 5;
          else if (flake.x > w + 5) flake.x = -5;
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180,220,255,${flake.alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      // --- Jellyfish ---
      if (showJellyfish)
        for (const jelly of jellies) {
          jelly.phase += jelly.pulseSpeed * dt;
          const bellPulse = 0.92 + 0.08 * Math.sin(jelly.phase); // subtle bell pulse
          const alpha = jelly.baseAlpha;
          const br = jelly.bellR * bellPulse;

          // Glow halo (in screen space, before squash transform)
          const glowR = br * 2.2;
          const glowCY = jelly.y - br * jelly.squash * 0.4;
          const glow = ctx.createRadialGradient(jelly.x, glowCY, 0, jelly.x, jelly.y, glowR);
          glow.addColorStop(
            0,
            `rgba(${jelly.r},${jelly.g},${jelly.b},${(alpha * 0.25).toFixed(3)})`,
          );
          glow.addColorStop(
            0.5,
            `rgba(${jelly.r},${jelly.g},${jelly.b},${(alpha * 0.08).toFixed(3)})`,
          );
          glow.addColorStop(1, `rgba(${jelly.r},${jelly.g},${jelly.b},0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(jelly.x, jelly.y, glowR, 0, Math.PI * 2);
          ctx.fill();

          // Bell dome (squashed semicircle, opening downward)
          ctx.save();
          ctx.translate(jelly.x, jelly.y);
          ctx.scale(1, jelly.squash);
          ctx.beginPath();
          // arc(x,y,r,0,PI,true) = top half of circle (anticlockwise) = dome shape
          ctx.arc(0, 0, br, 0, Math.PI, true);
          ctx.closePath();
          ctx.fillStyle = `rgba(${jelly.r},${jelly.g},${jelly.b},${(alpha * 0.12).toFixed(3)})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(${jelly.r},${jelly.g},${jelly.b},${(alpha * 0.55).toFixed(3)})`;
          ctx.lineWidth = 1.0;
          ctx.stroke();
          ctx.restore();

          // Tentacles hanging from bottom of bell (y = jelly.y in screen space)
          for (const ten of jelly.tentacles) {
            const startX = jelly.x + ten.offsetX * br;
            const startY = jelly.y;
            const sway = Math.sin(t * ten.swaySpeed + ten.phaseOffset) * ten.swayAmp;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.bezierCurveTo(
              startX + sway * 0.3,
              startY + ten.length * 0.35,
              startX + sway * 0.8,
              startY + ten.length * 0.65,
              startX + sway * 0.7,
              startY + ten.length,
            );
            ctx.strokeStyle = `rgba(${jelly.r},${jelly.g},${jelly.b},${(alpha * 0.45).toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }

          // Pulse flash ring
          if (jelly.flashAge >= 0) {
            const ringR = jelly.flashAge * 100;
            const ringAlpha = Math.max(0, 0.35 * (1 - jelly.flashAge));
            ctx.beginPath();
            ctx.arc(jelly.x, jelly.y, ringR, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${jelly.r},${jelly.g},${jelly.b},${ringAlpha.toFixed(3)})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            jelly.flashAge += dt;
            if (jelly.flashAge > 1.0) jelly.flashAge = -1;
          }

          // Flash timer countdown
          jelly.flashTimer -= dt;
          if (jelly.flashTimer <= 0 && jelly.flashAge < 0) {
            jelly.flashAge = 0;
            jelly.flashTimer = 10 + Math.random() * 12;
          }

          // Drift — wrap at top, sides
          jelly.x += jelly.vx;
          jelly.y += jelly.vy;
          const pad = jelly.bellR * 2 + 80;
          if (jelly.y < -pad) {
            jelly.y = h + pad;
            jelly.x = Math.random() * w;
          }
          if (jelly.x < -jelly.bellR * 2) jelly.x = w + jelly.bellR * 2;
          else if (jelly.x > w + jelly.bellR * 2) jelly.x = -jelly.bellR * 2;
        }

      // Heavy vignette
      const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.1, w / 2, h / 2, h * 0.88);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(0.65, "rgba(0,0,0,0.3)");
      vg.addColorStop(1, "rgba(0,0,0,0.78)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
    }

    function draw(now: number) {
      animId = requestAnimationFrame(draw);
      if (pausedRef.current) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      timeRef.current += dt;
      renderFrame(dt);
    }

    // Paint one static frame immediately so the background is visible even when paused
    renderFrame(0);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      if (!preview) window.removeEventListener("resize", resize);
    };
  }, [preview, showDepthBlobs, showJellyfish, showAmbientOrbs, showMarineSnow]);

  return (
    <canvas
      ref={canvasRef}
      className={`${preview ? "absolute" : "fixed"} pointer-events-none inset-0 z-0 opacity-95`}
    />
  );
});
