import { useEffect, useRef, useState } from "react";

interface Props {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
}

const KEYFRAMES = `
@keyframes rain-layer-1 {
  0%   { background-position: 0 0; }
  100% { background-position: -200px 900px; }
}
@keyframes rain-layer-2 {
  0%   { background-position: 0 0; }
  100% { background-position: -100px 700px; }
}
@keyframes rain-layer-3 {
  0%   { background-position: 0 0; }
  100% { background-position: -300px 1100px; }
}
@keyframes cloud-drift-1 {
  0%   { transform: translateX(-3%); }
  50%  { transform: translateX(3%); }
  100% { transform: translateX(-3%); }
}
@keyframes cloud-drift-2 {
  0%   { transform: translateX(4%); }
  50%  { transform: translateX(-2%); }
  100% { transform: translateX(4%); }
}
@keyframes lightning-flash {
  0%,100% { opacity: 0; }
  10%      { opacity: 0.7; }
  20%      { opacity: 0; }
  30%      { opacity: 0.5; }
  40%      { opacity: 0; }
}
`;

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

export function StormBackground({ colorLeft, colorMiddle, colorRight }: Props) {
  const [lightning, setLightning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [lr, lg, lb] = hexToRgb(colorLeft);
  const [mr, mg, mb] = hexToRgb(colorMiddle);
  const [rr, rg, rb] = hexToRgb(colorRight);

  useEffect(() => {
    function scheduleNext() {
      const delay = 2500 + Math.random() * 6000;
      timerRef.current = setTimeout(() => {
        setLightning(true);
        setTimeout(() => {
          setLightning(false);
          scheduleNext();
        }, 450);
      }, delay);
    }
    scheduleNext();
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <>
      <style>{KEYFRAMES}</style>

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Dark storm tint */}
        <div className="absolute inset-0 bg-[rgba(0,0,8,0.25)]" />

        {/* Cloud layer 1 */}
        <div
          className="absolute top-[-8%] left-[-15%] w-[80%] h-[40%] blur-[30px] animate-[cloud-drift-1_28s_ease-in-out_infinite]"
          style={{
            background: `radial-gradient(ellipse 100% 70% at 30% 50%, rgba(${lr},${lg},${lb},0.55) 0%, transparent 70%)`,
          }}
        />

        {/* Cloud layer 2 */}
        <div
          className="absolute top-[-5%] left-[30%] w-[90%] h-[45%] blur-[35px] animate-[cloud-drift-2_35s_ease-in-out_infinite]"
          style={{
            background: `radial-gradient(ellipse 100% 80% at 60% 40%, rgba(${mr},${mg},${mb},0.45) 0%, transparent 70%)`,
          }}
        />

        {/* Cloud layer 3 */}
        <div
          className="absolute top-[2%] left-[50%] w-[70%] h-[35%] blur-[25px] animate-[cloud-drift-1_22s_ease-in-out_infinite_reverse]"
          style={{
            background: `radial-gradient(ellipse 90% 65% at 45% 55%, rgba(${rr},${rg},${rb},0.35) 0%, transparent 70%)`,
          }}
        />

        {/* Rain — heavy foreground */}
        <div
          className="absolute inset-0 opacity-90 animate-[rain-layer-1_0.4s_linear_infinite] bg-size-[3px_30px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(170deg, rgba(200,220,255,0.18) 1px, transparent 1px)",
          }}
        />

        {/* Rain — medium mid-ground */}
        <div
          className="absolute inset-0 opacity-70 animate-[rain-layer-2_0.65s_linear_infinite] bg-size-[5px_45px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(165deg, rgba(180,210,255,0.12) 1px, transparent 1px)",
          }}
        />

        {/* Rain — distant background */}
        <div
          className="absolute inset-0 opacity-60 animate-[rain-layer-3_0.9s_linear_infinite] bg-size-[8px_60px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(172deg, rgba(200,230,255,0.08) 1px, transparent 1px)",
          }}
        />

        {/* Lightning flash */}
        {lightning && (
          <div className="absolute inset-0 pointer-events-none bg-[rgba(220,230,255,0.65)] animate-[lightning-flash_0.45s_ease-out_forwards]" />
        )}

        {/* Ground puddle shimmer */}
        <div
          className="absolute bottom-0 inset-x-0 h-[6%]"
          style={{
            background: `linear-gradient(to top, rgba(${mr},${mg},${mb},0.15), transparent)`,
          }}
        />
      </div>
    </>
  );
}
