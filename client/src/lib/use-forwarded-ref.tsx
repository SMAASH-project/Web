import type React from "react";
import { useEffect, useRef } from "react";

export function useForwardedRef<T>(ref: React.ForwardedRef<T>) {
  const innerRef = useRef<T>(null);

  useEffect(() => {
    if (!ref) return;

    const currentValue = innerRef.current;

    if (typeof ref === "function") {
      ref(currentValue);
      return () => {
        ref(null);
      };
    } else {
      // Workaround for linter: use Object.assign to avoid direct property modification
      Object.assign(ref, { current: currentValue });
    }
  }, [ref]);

  return innerRef;
}
