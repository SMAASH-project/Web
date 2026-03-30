import { useEffect, useRef } from "react";

interface Props {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  paused?: boolean;
  preview?: boolean;
  showSky?: boolean;
  showSun?: boolean;
  showGrid?: boolean;
  showScanlines?: boolean;
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

function lighten(
  [r, g, b]: [number, number, number],
  amt: number,
): [number, number, number] {
  return [
    Math.min(255, r + amt),
    Math.min(255, g + amt),
    Math.min(255, b + amt),
  ];
}

export function SynthwaveBackground({
  colorLeft,
  colorMiddle,
  colorRight,
  paused = false,
  preview = false,
  showSky = true,
  showSun = true,
  showGrid = true,
  showScanlines = true,
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

    const cL = hexToRgb(colorLeft);
    const cM = hexToRgb(colorMiddle);
    const cR = hexToRgb(colorRight);
    const bright = lighten(cM, 80);

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      t += 0.016;

      ctx!.clearRect(0, 0, w, h);

      const horizon = h * 0.48;
      const vpX = w / 2;

      // ── Sky gradient ─────────────────────────────────────────────────────
      if (showSky) {
        const sky = ctx!.createLinearGradient(0, 0, 0, horizon);
        sky.addColorStop(0, `rgb(${cL[0]},${cL[1]},${cL[2]})`);
        sky.addColorStop(0.6, `rgb(${cM[0]},${cM[1]},${cM[2]})`);
        sky.addColorStop(1, `rgb(${bright[0]},${bright[1]},${bright[2]})`);
        ctx!.fillStyle = sky;
        ctx!.fillRect(0, 0, w, horizon);
      }

      // ── Retro sun ─────────────────────────────────────────────────────────
      if (showSun) {
        const sunR = w * 0.13;
        const sunCX = vpX;
        const sunCY = horizon - sunR * 0.05;

        // Sun gradient
        const sunGrad = ctx!.createRadialGradient(
          sunCX,
          sunCY,
          0,
          sunCX,
          sunCY,
          sunR,
        );
        sunGrad.addColorStop(
          0,
          `rgb(${Math.min(255, bright[0] + 40)},${Math.min(255, bright[1] + 20)},${Math.min(255, bright[2] + 80)})`,
        );
        sunGrad.addColorStop(0.5, `rgb(${bright[0]},${bright[1]},${bright[2]})`);
        sunGrad.addColorStop(1, `rgb(${cR[0]},${cR[1]},${cR[2]})`);

        // Clip to semicircle
        ctx!.save();
        ctx!.beginPath();
        ctx!.arc(sunCX, sunCY, sunR, Math.PI, 0); // top half
        ctx!.lineTo(sunCX + sunR, sunCY);
        ctx!.lineTo(sunCX - sunR, sunCY);
        ctx!.closePath();
        ctx!.clip();
        ctx!.beginPath();
        ctx!.arc(sunCX, sunCY, sunR, 0, Math.PI * 2);
        ctx!.fillStyle = sunGrad;
        ctx!.fill();

        // Horizontal stripe cutouts (scanline effect on sun)
        const stripeCount = 9;
        const stripeH = (sunR * 0.72) / (stripeCount * 1.6);
        for (let i = 0; i < stripeCount; i++) {
          const sy = sunCY - sunR * 0.08 - i * (stripeH * 2.6);
          ctx!.fillStyle = `rgba(0,0,0,${0.35 + i * 0.025})`;
          ctx!.fillRect(sunCX - sunR, sy, sunR * 2, stripeH);
        }
        ctx!.restore();
      }

      // ── Ground ─────────────────────────────────────────────────────────────
      const ground = ctx!.createLinearGradient(0, horizon, 0, h);
      ground.addColorStop(0, `rgb(${cM[0]},${cM[1]},${cM[2]})`);
      ground.addColorStop(
        0.2,
        `rgb(${Math.max(0, cL[0] - 30)},${Math.max(0, cL[1] - 30)},${Math.max(0, cL[2] - 30)})`,
      );
      ground.addColorStop(1, "rgb(0,0,0)");
      ctx!.fillStyle = ground;
      ctx!.fillRect(0, horizon, w, h - horizon);

      // Horizon glow line
      ctx!.save();
      ctx!.globalAlpha = 0.6;
      const hglow = ctx!.createLinearGradient(0, 0, w, 0);
      hglow.addColorStop(0, "transparent");
      hglow.addColorStop(0.2, `rgb(${bright[0]},${bright[1]},${bright[2]})`);
      hglow.addColorStop(
        0.5,
        `rgb(${Math.min(255, bright[0] + 60)},${Math.min(255, bright[1] + 60)},${Math.min(255, bright[2] + 60)})`,
      );
      hglow.addColorStop(0.8, `rgb(${bright[0]},${bright[1]},${bright[2]})`);
      hglow.addColorStop(1, "transparent");
      ctx!.fillStyle = hglow;
      ctx!.fillRect(0, horizon - 2, w, 4);
      ctx!.restore();

      // ── Perspective grid ─────────────────────────────────────────────────
      if (showGrid) {
        const gridColor = `rgba(${bright[0]},${bright[1]},${bright[2]},0.55)`;
        const gridFade = `rgba(${bright[0]},${bright[1]},${bright[2]},0)`;
        ctx!.strokeStyle = gridColor;
        ctx!.lineWidth = 0.8;

        // Vertical lines (fan from vanishing point)
        const vLines = 24;
        for (let i = 0; i <= vLines; i++) {
          const bx = (w / vLines) * i;
          const lg = ctx!.createLinearGradient(vpX, horizon, bx, h);
          lg.addColorStop(0, gridFade);
          lg.addColorStop(0.3, gridColor);
          lg.addColorStop(1, gridColor);
          ctx!.strokeStyle = lg;
          ctx!.beginPath();
          ctx!.moveTo(vpX, horizon);
          ctx!.lineTo(bx, h);
          ctx!.stroke();
        }

        // Horizontal lines — perspective spacing, scrolling toward viewer
        const hLines = 18;
        const scrollPeriod = 2.0;
        const scrollOffset = (t % scrollPeriod) / scrollPeriod;

        for (let i = 0; i <= hLines; i++) {
          const raw = (i + scrollOffset) / hLines;
          const perspY = horizon + (h - horizon) * Math.pow(raw, 2.8);
          if (perspY < horizon || perspY > h + 1) continue;

          const alpha = Math.pow(raw, 0.6) * 0.6;
          const hg = ctx!.createLinearGradient(0, perspY, w, perspY);
          hg.addColorStop(0, "transparent");
          hg.addColorStop(0.1, `rgba(${bright[0]},${bright[1]},${bright[2]},${alpha})`);
          hg.addColorStop(0.9, `rgba(${bright[0]},${bright[1]},${bright[2]},${alpha})`);
          hg.addColorStop(1, "transparent");
          ctx!.strokeStyle = hg;
          ctx!.lineWidth = 0.8;
          ctx!.beginPath();
          ctx!.moveTo(0, perspY);
          ctx!.lineTo(w, perspY);
          ctx!.stroke();
        }
      }

      // ── Scanline overlay ──────────────────────────────────────────────────
      if (showScanlines) {
        ctx!.save();
        ctx!.globalAlpha = 0.04;
        for (let y = 0; y < h; y += 4) {
          ctx!.fillStyle = "rgba(0,0,0,1)";
          ctx!.fillRect(0, y, w, 2);
        }
        ctx!.restore();
      }

      if (!paused) animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      if (!preview) window.removeEventListener("resize", resize);
    };
  }, [colorLeft, colorMiddle, colorRight, showSky, showSun, showGrid, showScanlines]);

  return (
    <canvas
      ref={canvasRef}
      className={`${preview ? "absolute" : "fixed"} inset-0 z-0 opacity-[0.72] pointer-events-none`}
    />
  );
}
