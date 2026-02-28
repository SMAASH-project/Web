export const accordionSpring = {
  type: "spring" as const,
  stiffness: 230,
  damping: 20,
  mass: 0.85,
};

export function getAccordionAnimate(isOpen: boolean, contentHeight: number) {
  if (isOpen) {
    return {
      height: contentHeight,
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        height: accordionSpring,
        y: accordionSpring,
        scale: accordionSpring,
        opacity: { duration: 0.24, ease: "easeOut" as const },
      },
    };
  }

  return {
    height: 0,
    opacity: 0,
    y: -8,
    scale: 0.98,
  };
}

export const accordionTransition = {
  height: accordionSpring,
  y: accordionSpring,
  scale: accordionSpring,
  opacity: { duration: 0.2, ease: "easeInOut" as const },
};
