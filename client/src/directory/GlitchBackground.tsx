import { useEffect, useRef } from "react";

interface Props {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  paused?: boolean;
}

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  const full = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

export function GlitchBackground({ colorLeft, colorMiddle, colorRight, paused = false }: Props) {
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

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    // ── Glitch event scheduler ─────────────────────────────────────────────
    interface GlitchEvent {
      type: "tear" | "shift" | "noise" | "scanline" | "chromatic";
      startT: number;
      duration: number;
      intensity: number;
      y?: number;
      height?: number;
      dx?: number;
    }

    let events: GlitchEvent[] = [];
    let nextEvent = 1.0 + Math.random() * 2;

    function spawnEvent() {
      const now = t;
      const types: GlitchEvent["type"][] = ["tear", "shift", "noise", "scanline", "chromatic"];
      const type = types[Math.floor(Math.random() * types.length)];
      const h = canvas!.height;
      events.push({
        type,
        startT: now,
        duration: 0.06 + Math.random() * 0.18,
        intensity: 0.4 + Math.random() * 0.6,
        y: Math.random() * h,
        height: 4 + Math.random() * 60,
        dx: (Math.random() - 0.5) * 80,
      });
      // Sometimes cluster two events
      if (Math.random() < 0.4) {
        events.push({
          type: types[Math.floor(Math.random() * types.length)],
          startT: now + 0.04,
          duration: 0.04 + Math.random() * 0.1,
          intensity: 0.3 + Math.random() * 0.5,
          y: Math.random() * h,
          height: 2 + Math.random() * 30,
          dx: (Math.random() - 0.5) * 40,
        });
      }
    }

    // ── Scanline grid (always visible) ────────────────────────────────────
    function drawScanlines(w: number, h: number) {
      ctx!.save();
      ctx!.globalAlpha = 0.04;
      for (let y = 0; y < h; y += 4) {
        ctx!.fillStyle = "rgba(0,0,0,1)";
        ctx!.fillRect(0, y, w, 2);
      }
      ctx!.restore();
    }

    // ── Vertical CRT vignette ─────────────────────────────────────────────
    function drawVignette(w: number, h: number) {
      const vg = ctx!.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.9);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx!.fillStyle = vg;
      ctx!.fillRect(0, 0, w, h);
    }

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      t += DT;

      ctx!.clearRect(0, 0, w, h);

      // ── Base gradient ────────────────────────────────────────────────────
      const bg = ctx!.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, `rgba(${lr},${lg},${lb},0.18)`);
      bg.addColorStop(0.5, `rgba(${mr},${mg},${mb},0.12)`);
      bg.addColorStop(1, `rgba(${rr},${rg},${rb},0.18)`);
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, w, h);

      // ── Subtle hex/grid pattern ──────────────────────────────────────────
      ctx!.save();
      ctx!.globalAlpha = 0.025;
      const gridSize = 48;
      ctx!.strokeStyle = `rgb(${mr},${mg},${mb})`;
      ctx!.lineWidth = 0.5;
      for (let x = 0; x < w; x += gridSize) {
        ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, h); ctx!.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(w, y); ctx!.stroke();
      }
      ctx!.restore();

      // ── Scrolling theme-colored lines ────────────────────────────────────
      const lineY = (t * 60) % h;
      const lineGrad = ctx!.createLinearGradient(0, lineY - 2, 0, lineY + 2);
      lineGrad.addColorStop(0, "rgba(0,0,0,0)");
      lineGrad.addColorStop(0.5, `rgba(${mr},${mg},${mb},0.15)`);
      lineGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.fillStyle = lineGrad;
      ctx!.fillRect(0, lineY - 2, w, 4);

      // ── Spawn events ─────────────────────────────────────────────────────
      nextEvent -= DT;
      if (nextEvent <= 0) {
        spawnEvent();
        nextEvent = 0.8 + Math.random() * 3.5;
      }

      // ── Process active events ─────────────────────────────────────────────
      events = events.filter(e => t - e.startT < e.duration);
      for (const e of events) {
        const progress = (t - e.startT) / e.duration;
        const alpha = Math.sin(progress * Math.PI) * e.intensity;

        switch (e.type) {
          case "tear": {
            // Horizontal slice shifted with RGB offset
            const sy = e.y! - e.height! / 2;
            const sh = e.height!;
            ctx!.save();
            // Red channel shifted left
            ctx!.globalAlpha = alpha * 0.5;
            ctx!.globalCompositeOperation = "screen";
            ctx!.fillStyle = `rgba(255,0,80,0.3)`;
            ctx!.fillRect(0 + e.dx! * 0.8, sy, w, sh);
            // Cyan channel shifted right
            ctx!.fillStyle = `rgba(0,255,220,0.2)`;
            ctx!.fillRect(0 - e.dx! * 0.4, sy, w, sh);
            ctx!.restore();
            // White noise strip
            ctx!.save();
            ctx!.globalAlpha = alpha * 0.15;
            const imgData = ctx!.createImageData(w, Math.max(1, Math.floor(sh)));
            for (let i = 0; i < imgData.data.length; i += 4) {
              const v = Math.random() * 255;
              imgData.data[i] = v; imgData.data[i + 1] = v; imgData.data[i + 2] = v; imgData.data[i + 3] = 255;
            }
            ctx!.putImageData(imgData, 0, Math.max(0, sy));
            ctx!.restore();
            break;
          }
          case "shift": {
            // Whole screen horizontal shift with color split
            ctx!.save();
            ctx!.globalAlpha = alpha * 0.25;
            ctx!.globalCompositeOperation = "screen";
            ctx!.fillStyle = `rgba(${rr},0,${rb},0.4)`;
            ctx!.fillRect(e.dx! * 0.5, 0, w, h);
            ctx!.fillStyle = `rgba(0,${mg},${mb},0.3)`;
            ctx!.fillRect(-e.dx! * 0.3, 0, w, h);
            ctx!.restore();
            break;
          }
          case "noise": {
            // Random pixel noise in a band
            const ny = Math.max(0, e.y! - e.height!);
            const nh = Math.min(h - ny, e.height! * 2);
            const noiseData = ctx!.createImageData(w, Math.max(1, Math.floor(nh)));
            for (let i = 0; i < noiseData.data.length; i += 4) {
              if (Math.random() < 0.3) {
                noiseData.data[i] = Math.random() * 255;
                noiseData.data[i + 1] = Math.random() * 255;
                noiseData.data[i + 2] = Math.random() * 255;
                noiseData.data[i + 3] = alpha * 180;
              }
            }
            ctx!.putImageData(noiseData, 0, ny);
            break;
          }
          case "scanline": {
            // Bright horizontal flash line
            ctx!.save();
            ctx!.globalAlpha = alpha * 0.6;
            const sg = ctx!.createLinearGradient(0, e.y! - 2, 0, e.y! + 2);
            sg.addColorStop(0, "rgba(0,0,0,0)");
            sg.addColorStop(0.5, `rgba(${mr},${mg},${mb},1)`);
            sg.addColorStop(1, "rgba(0,0,0,0)");
            ctx!.fillStyle = sg;
            ctx!.fillRect(0, e.y! - 4, w, 8);
            ctx!.restore();
            break;
          }
          case "chromatic": {
            // RGB split on bottom half
            ctx!.save();
            ctx!.globalAlpha = alpha * 0.18;
            ctx!.globalCompositeOperation = "screen";
            ctx!.fillStyle = `rgba(255,30,100,0.5)`;
            ctx!.fillRect(4, h / 2, w, h / 2);
            ctx!.fillStyle = `rgba(30,255,200,0.4)`;
            ctx!.fillRect(-4, h / 2, w, h / 2);
            ctx!.restore();
            break;
          }
        }
      }

      drawScanlines(w, h);
      drawVignette(w, h);

      if (!paused) animId = requestAnimationFrame(draw);
    }

    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, [colorLeft, colorMiddle, colorRight]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-75 pointer-events-none" />;
}
