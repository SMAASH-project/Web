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

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  layer: number;
  // colour tint: 0=white, 1=blue-white, 2=orange, 3=red
  colorType: number;
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
  r: number;
  g: number;
  b: number;
}

const STAR_COLORS: Array<[number, number, number]> = [
  [255, 255, 255], // white
  [180, 210, 255], // blue-white
  [255, 200, 130], // orange
  [255, 140, 140], // red
];

export function DeepSpaceBackground({
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

    let animId: number;
    let t = 0;
    let shootingTimer = 0;
    const SHOOT_INTERVAL = 60 + Math.random() * 80; // ~1–2.3 s at 60 fps

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const [lr, lg, lb] = hexToRgb(colorLeft);
    const [mr, mg, mb] = hexToRgb(colorMiddle);
    const [rr, rg, rb] = hexToRgb(colorRight);

    // Stars — 85% white, 8% blue, 5% orange, 2% red
    const TYPE_WEIGHTS = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 3,
    ]; // index into STAR_COLORS
    const stars: Star[] = Array.from({ length: 300 }, () => {
      const layer = Math.floor(Math.random() * 3);
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius:
          layer === 0
            ? 0.4 + Math.random() * 0.6
            : layer === 1
              ? 0.7 + Math.random() * 1.0
              : 1.1 + Math.random() * 1.8,
        baseAlpha:
          layer === 0
            ? 0.45 + Math.random() * 0.4
            : layer === 1
              ? 0.65 + Math.random() * 0.3
              : 0.82 + Math.random() * 0.18,
        alpha: 0,
        twinkleSpeed: 0.3 + Math.random() * 1.8,
        twinklePhase: Math.random() * Math.PI * 2,
        layer,
        colorType:
          TYPE_WEIGHTS[Math.floor(Math.random() * TYPE_WEIGHTS.length)],
      };
    });
    for (const s of stars) s.alpha = s.baseAlpha;

    // Milky Way band — dense small stars at a diagonal
    const milkyWayStars: {
      x: number;
      y: number;
      alpha: number;
      radius: number;
    }[] = Array.from({ length: 280 }, () => {
      // Diagonal band from top-left to bottom-right
      const t2 = Math.random();
      const perp = (Math.random() - 0.5) * 0.22; // spread perpendicular
      const bx = (t2 + perp) * window.innerWidth;
      const by = t2 * window.innerHeight + perp * window.innerHeight * 0.5;
      return {
        x: bx,
        y: by,
        alpha: 0.12 + Math.random() * 0.35,
        radius: 0.3 + Math.random() * 0.6,
      };
    });

    // Nebulae — more vivid, more layered
    const nebulae = [
      {
        x: 0.12,
        y: 0.22,
        rx: 280,
        ry: 160,
        r: lr,
        g: lg,
        b: lb,
        phase: 0,
        depth: 1.0,
      },
      {
        x: 0.78,
        y: 0.58,
        rx: 240,
        ry: 210,
        r: mr,
        g: mg,
        b: mb,
        phase: 1.7,
        depth: 1.0,
      },
      {
        x: 0.52,
        y: 0.12,
        rx: 200,
        ry: 120,
        r: rr,
        g: rg,
        b: rb,
        phase: 3.2,
        depth: 0.8,
      },
      {
        x: 0.35,
        y: 0.68,
        rx: 160,
        ry: 190,
        r: lr,
        g: lg,
        b: lb,
        phase: 4.5,
        depth: 0.6,
      },
      // Bright core inside nebula 1
      {
        x: 0.11,
        y: 0.2,
        rx: 80,
        ry: 60,
        r: Math.min(255, lr + 80),
        g: Math.min(255, lg + 80),
        b: Math.min(255, lb + 80),
        phase: 0.3,
        depth: 0.4,
      },
    ];

    const shootingStars: ShootingStar[] = [];

    function drawNebulae(w: number, h: number) {
      for (const n of nebulae) {
        const cx = n.x * w;
        const cy = n.y * h;
        const alpha = (0.22 + Math.sin(t * 0.22 + n.phase) * 0.08) * n.depth;
        ctx!.save();
        ctx!.globalAlpha = Math.max(0, alpha);
        const grad = ctx!.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          Math.max(n.rx, n.ry),
        );
        grad.addColorStop(0, `rgba(${n.r},${n.g},${n.b},1)`);
        grad.addColorStop(0.3, `rgba(${n.r},${n.g},${n.b},0.75)`);
        grad.addColorStop(0.65, `rgba(${n.r},${n.g},${n.b},0.35)`);
        grad.addColorStop(1, `rgba(${n.r},${n.g},${n.b},0)`);
        ctx!.scale(1, n.ry / n.rx);
        ctx!.beginPath();
        ctx!.arc(cx, cy * (n.rx / n.ry), n.rx, 0, Math.PI * 2);
        ctx!.fillStyle = grad;
        ctx!.fill();
        ctx!.restore();
      }
    }

    function drawMilkyWay() {
      ctx!.save();
      ctx!.globalAlpha = 1;
      for (const ms of milkyWayStars) {
        ctx!.globalAlpha = ms.alpha;
        ctx!.fillStyle = "white";
        ctx!.beginPath();
        ctx!.arc(ms.x, ms.y, ms.radius, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.restore();
    }

    function drawShootingStar(ss: ShootingStar) {
      if (!ss.active) return;
      const spd = Math.hypot(ss.vx, ss.vy);
      const tailX = ss.x - (ss.vx / spd) * ss.length * ss.life;
      const tailY = ss.y - (ss.vy / spd) * ss.length * ss.life;
      const grad = ctx!.createLinearGradient(tailX, tailY, ss.x, ss.y);
      grad.addColorStop(0, `rgba(${ss.r},${ss.g},${ss.b},0)`);
      grad.addColorStop(0.6, `rgba(${ss.r},${ss.g},${ss.b},${ss.alpha * 0.6})`);
      grad.addColorStop(1, `rgba(${ss.r},${ss.g},${ss.b},${ss.alpha})`);
      ctx!.save();
      ctx!.globalAlpha = ss.life;
      // Core streak
      ctx!.beginPath();
      ctx!.moveTo(tailX, tailY);
      ctx!.lineTo(ss.x, ss.y);
      ctx!.strokeStyle = grad;
      ctx!.lineWidth = 1.8;
      ctx!.stroke();
      // Glow around head
      const headGlow = ctx!.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, 5);
      headGlow.addColorStop(0, `rgba(${ss.r},${ss.g},${ss.b},0.8)`);
      headGlow.addColorStop(1, `rgba(${ss.r},${ss.g},${ss.b},0)`);
      ctx!.globalAlpha = ss.life * 0.9;
      ctx!.fillStyle = headGlow;
      ctx!.beginPath();
      ctx!.arc(ss.x, ss.y, 5, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.restore();
    }

    function makeShootingStar(w: number, h: number): ShootingStar {
      const angle = Math.PI / 6 + Math.random() * (Math.PI / 4);
      const speed = 11 + Math.random() * 12;
      const colorIdx = Math.random() < 0.5 ? 0 : Math.random() < 0.5 ? 1 : 2;
      const [r, g, b] = STAR_COLORS[colorIdx];
      return {
        active: true,
        x: Math.random() * w * 0.8,
        y: Math.random() * h * 0.45,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: 90 + Math.random() * 130,
        alpha: 1,
        life: 1,
        r,
        g,
        b,
      };
    }

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      t += 0.016;
      shootingTimer++;

      ctx!.clearRect(0, 0, w, h);

      // Deep space dark overlay so stars/nebulae pop against any gradient bg
      ctx!.fillStyle = "rgba(0,0,8,0.55)";
      ctx!.fillRect(0, 0, w, h);

      drawMilkyWay();
      drawNebulae(w, h);

      // Stars
      for (const s of stars) {
        s.alpha =
          s.baseAlpha +
          Math.sin(t * s.twinkleSpeed + s.twinklePhase) * s.baseAlpha * 0.45;
        const [sr, sg, sb] = STAR_COLORS[s.colorType];
        ctx!.save();
        ctx!.globalAlpha = Math.max(0, s.alpha);

        if (s.layer === 2) {
          // Glow halo
          const glow = ctx!.createRadialGradient(
            s.x,
            s.y,
            0,
            s.x,
            s.y,
            s.radius * 5.5,
          );
          glow.addColorStop(0, `rgba(${sr},${sg},${sb},0.80)`);
          glow.addColorStop(1, `rgba(${sr},${sg},${sb},0)`);
          ctx!.fillStyle = glow;
          ctx!.beginPath();
          ctx!.arc(s.x, s.y, s.radius * 4, 0, Math.PI * 2);
          ctx!.fill();
          // 4-point diffraction spike on brightest stars
          if (s.baseAlpha > 0.85) {
            ctx!.globalAlpha = Math.max(0, s.alpha * 0.4);
            ctx!.strokeStyle = `rgba(${sr},${sg},${sb},1)`;
            ctx!.lineWidth = 0.5;
            const sp = s.radius * 5;
            ctx!.beginPath();
            ctx!.moveTo(s.x - sp, s.y);
            ctx!.lineTo(s.x + sp, s.y);
            ctx!.moveTo(s.x, s.y - sp);
            ctx!.lineTo(s.x, s.y + sp);
            ctx!.stroke();
          }
        }

        ctx!.globalAlpha = Math.max(0, s.alpha);
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${sr},${sg},${sb},1)`;
        ctx!.fill();
        ctx!.restore();
      }

      // Shooting stars
      if (shootingTimer > SHOOT_INTERVAL && Math.random() < 0.06) {
        shootingTimer = 0;
        shootingStars.push(makeShootingStar(w, h));
        if (shootingStars.length > 5) shootingStars.shift();
      }
      for (const ss of shootingStars) {
        if (!ss.active) continue;
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life -= 0.02;
        ss.alpha = ss.life;
        if (ss.life <= 0 || ss.x > w + 60 || ss.y > h + 60) ss.active = false;
        drawShootingStar(ss);
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
      className="fixed inset-0 z-0 opacity-95 pointer-events-none"
    />
  );
}
