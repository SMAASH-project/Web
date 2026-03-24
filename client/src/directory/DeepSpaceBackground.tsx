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

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  layer: number; // 0=far, 1=mid, 2=near
}

interface ShootingStar {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  life: number;
}

function makeShootingStar(w: number, h: number): ShootingStar {
  const angle = Math.PI / 6 + Math.random() * (Math.PI / 4);
  const speed = 12 + Math.random() * 10;
  return {
    active: true,
    x: Math.random() * w * 0.7,
    y: Math.random() * h * 0.4,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    length: 80 + Math.random() * 120,
    alpha: 1,
    life: 1,
  };
}

export function DeepSpaceBackground({
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
    let shootingTimer = 0;
    const SHOOT_INTERVAL = 180 + Math.random() * 240; // frames

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const [lr, lg, lb] = hexToRgb(colorLeft);
    const [mr, mg, mb] = hexToRgb(colorMiddle);
    const [rr, rg, rb] = hexToRgb(colorRight);

    // Generate stars
    const stars: Star[] = Array.from({ length: 280 }, () => {
      const layer = Math.floor(Math.random() * 3);
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius:
          layer === 0
            ? 0.5 + Math.random() * 0.7
            : layer === 1
              ? 0.8 + Math.random() * 1
              : 1.2 + Math.random() * 1.5,
        baseAlpha:
          layer === 0
            ? 0.3 + Math.random() * 0.4
            : layer === 1
              ? 0.5 + Math.random() * 0.35
              : 0.7 + Math.random() * 0.3,
        alpha: 0,
        twinkleSpeed: 0.3 + Math.random() * 1.5,
        twinklePhase: Math.random() * Math.PI * 2,
        layer,
      };
    });

    for (const s of stars) s.alpha = s.baseAlpha;

    const shootingStars: ShootingStar[] = [];

    // Nebula blobs (static positions, animated opacity)
    const nebulae = [
      { x: 0.15, y: 0.25, rx: 220, ry: 140, r: lr, g: lg, b: lb, phase: 0 },
      { x: 0.75, y: 0.6, rx: 180, ry: 200, r: mr, g: mg, b: mb, phase: 1.5 },
      { x: 0.5, y: 0.15, rx: 160, ry: 100, r: rr, g: rg, b: rb, phase: 3.0 },
    ];

    function drawNebula(w: number, h: number) {
      for (const n of nebulae) {
        const cx = n.x * w;
        const cy = n.y * h;
        const alpha = 0.06 + Math.sin(t * 0.25 + n.phase) * 0.025;
        ctx!.save();
        ctx!.globalAlpha = alpha;
        const grad = ctx!.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          Math.max(n.rx, n.ry),
        );
        grad.addColorStop(0, `rgba(${n.r},${n.g},${n.b},1)`);
        grad.addColorStop(0.5, `rgba(${n.r},${n.g},${n.b},0.4)`);
        grad.addColorStop(1, `rgba(${n.r},${n.g},${n.b},0)`);
        ctx!.scale(1, n.ry / n.rx);
        ctx!.beginPath();
        ctx!.arc(cx, cy * (n.rx / n.ry), n.rx, 0, Math.PI * 2);
        ctx!.fillStyle = grad;
        ctx!.fill();
        ctx!.restore();
      }
    }

    function drawShootingStar(ss: ShootingStar) {
      if (!ss.active) return;
      const tailX =
        ss.x - (ss.vx / Math.hypot(ss.vx, ss.vy)) * ss.length * ss.life;
      const tailY =
        ss.y - (ss.vy / Math.hypot(ss.vx, ss.vy)) * ss.length * ss.life;
      const grad = ctx!.createLinearGradient(tailX, tailY, ss.x, ss.y);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(1, `rgba(255,255,255,${ss.alpha * 0.9})`);
      ctx!.save();
      ctx!.globalAlpha = ss.life;
      ctx!.beginPath();
      ctx!.moveTo(tailX, tailY);
      ctx!.lineTo(ss.x, ss.y);
      ctx!.strokeStyle = grad;
      ctx!.lineWidth = 1.5;
      ctx!.stroke();
      ctx!.restore();
    }

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      t += 0.016;
      shootingTimer++;

      ctx!.clearRect(0, 0, w, h);

      // Nebulae
      drawNebula(w, h);

      // Stars
      for (const s of stars) {
        s.alpha =
          s.baseAlpha +
          Math.sin(t * s.twinkleSpeed + s.twinklePhase) * s.baseAlpha * 0.4;
        ctx!.save();
        ctx!.globalAlpha = Math.max(0, s.alpha);
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx!.fillStyle = "white";
        // Bright stars get a tiny glow
        if (s.layer === 2) {
          const glow = ctx!.createRadialGradient(
            s.x,
            s.y,
            0,
            s.x,
            s.y,
            s.radius * 3,
          );
          glow.addColorStop(0, "rgba(255,255,255,0.6)");
          glow.addColorStop(1, "rgba(255,255,255,0)");
          ctx!.fillStyle = glow;
          ctx!.beginPath();
          ctx!.arc(s.x, s.y, s.radius * 3, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx!.fillStyle = "white";
        ctx!.fill();
        ctx!.restore();
      }

      // Shooting stars
      if (
        shootingTimer > shootingStars.length + SHOOT_INTERVAL &&
        Math.random() < 0.02
      ) {
        shootingTimer = 0;
        shootingStars.push(makeShootingStar(w, h));
        if (shootingStars.length > 4) shootingStars.shift();
      }
      for (const ss of shootingStars) {
        if (!ss.active) continue;
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life -= 0.022;
        ss.alpha = ss.life;
        if (ss.life <= 0 || ss.x > w + 50 || ss.y > h + 50) ss.active = false;
        drawShootingStar(ss);
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
      className="fixed inset-0 z-0 opacity-75 pointer-events-none"
    />
  );
}
