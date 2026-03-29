import { useEffect, useRef, useState } from "react";

export function useScrollDirection(threshold = 8) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastY.current;
      if (Math.abs(diff) > threshold) {
        setHidden(currentY > lastY.current && currentY > 80);
        lastY.current = currentY;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return hidden;
}
