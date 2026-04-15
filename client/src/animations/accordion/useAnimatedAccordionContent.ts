import * as React from "react";

export function useAnimatedAccordionContent(children: React.ReactNode) {
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [contentHeight, setContentHeight] = React.useState(0);

  React.useLayoutEffect(() => {
    const element = innerRef.current;
    if (!element) return;

    const updateHeight = () => setContentHeight(element.scrollHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, [children]);

  React.useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const checkState = () => {
      const state = element.getAttribute("data-state");
      setIsOpen(state === "open");
    };

    checkState();

    const observer = new MutationObserver(checkState);
    observer.observe(element, {
      attributes: true,
      attributeFilter: ["data-state"],
    });

    return () => observer.disconnect();
  }, []);

  return {
    contentRef,
    innerRef,
    isOpen,
    contentHeight,
  };
}
