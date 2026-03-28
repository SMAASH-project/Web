"use client";

import { useAnimate } from "motion/react";
import { useEffect, useRef } from "react";

interface UseColorAnimationProps {
  elementRef: React.RefObject<HTMLDivElement>;
  gradient: string;
  duration?: number;
  useAnimation: boolean;
}

/**
 * Hook that animates gradient changes using Motion
 */
export function useColorAnimation({
  elementRef,
  gradient,
  duration = 0.6,
  useAnimation,
}: UseColorAnimationProps) {
  const [, animate] = useAnimate();
  const prevGradientRef = useRef<string>(gradient);

  useEffect(() => {
    if (!useAnimation) return;

    const element = elementRef.current;
    if (!element) return;

    // Only animate if gradient changed
    if (prevGradientRef.current === gradient) return;

    animate(
      element,
      { backgroundImage: [prevGradientRef.current, gradient] },
      {
        duration,
        ease: "easeInOut",
      },
    );

    prevGradientRef.current = gradient;
  }, [gradient, duration, useAnimation, animate, elementRef]);
}
