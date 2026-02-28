"use client";

import { useAnimate } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * A comparison of color interpolation between Motion and the Web Animations API.
 * Motion uses RGB interpolation by default, while WAAPI uses HSL interpolation.
 */
export default function ColorInterpolation() {
  const waapiRef = useRef<HTMLDivElement>(null);
  const [motionRef, animate] = useAnimate();

  useEffect(() => {
    const waapiElement = waapiRef.current;
    const motionElement = motionRef.current;

    if (!waapiElement) return;

    const waapiAnimation = waapiElement.animate(
      [{ backgroundColor: "#ff0088" }, { backgroundColor: "#0d63f8" }],
      {
        duration: 2000,
        iterations: Infinity,
        direction: "alternate",
        easing: "linear",
      },
    );

    const motionAnimation = animate(
      motionElement,
      { backgroundColor: ["#ff0088", "#0d63f8"] },
      {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "linear",
      },
    );

    console.log(motionAnimation);

    return () => {
      waapiAnimation.cancel();
      motionAnimation.cancel();
    };
  }, []);

  return (
    <>
      <div className="container">
        <div className="swatch-container">
          <div className="swatch waapi" ref={waapiRef} />
          <div className="label small">Browser</div>
        </div>
        <div className="swatch-container">
          <div className="swatch motion" ref={motionRef} />
          <div className="label small">Motion</div>
        </div>
      </div>
      <Stylesheet />
    </>
  );
}

/**
 * ==============   Styles   ================
 */
function Stylesheet() {
  return (
    <style>
      {`
                .container {
                    display: flex;
                    gap: 30px;
                    align-items: center;
                    justify-content: center;
                }

                .swatch-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }

                .swatch {
                    width: 100px;
                    height: 100px;
                    border-radius: 8px;
                    background-color: #ff0088;
                }

                .label {
                    color: #f5f5f5;
                    font-size: 14px;
                }
            `}
    </style>
  );
}
