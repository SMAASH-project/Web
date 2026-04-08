import { useNavbarContext } from "@/context/NavbarContextUtils";
import { useEffect, useState, useRef, type ComponentType } from "react";
import { useMediaQuery } from "@/components/nav/navLogic/useMediaQuery";
import { m } from "motion/react";

export function WithOnloadAnimation(WrappedComponent: ComponentType) {
  return function OnloadAnimation() {
    const [hidden, setHidden] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const { isDropdownHovering, setIsDropdownHovering, isDropdownOpen } = useNavbarContext();
    const isFreshMountRef = useRef(true);
    const isMobile = !useMediaQuery("(min-width: 768px)");

    useEffect(() => {
      // Reset dropdown hovering state when page loads
      setIsDropdownHovering(false);
      isFreshMountRef.current = true;

      // keep navbar visible on load, then hide after 1.2s
      const timer = setTimeout(() => {
        setHidden(true);
        isFreshMountRef.current = false;
      }, 1200);

      return () => clearTimeout(timer);
    }, [setIsDropdownHovering]);

    // On mobile, always render the navbar without the peek animation
    if (isMobile) {
      return <WrappedComponent />;
    }

    // Lock navbar open if the dropdown menu is open OR content is being hovered,
    // but only after the initial mount animation has completed
    const shouldLockNavbar = !isFreshMountRef.current && (isDropdownOpen || isDropdownHovering);

    const isVisible = !hidden || shouldLockNavbar || isHovering;

    return (
      <m.div
        initial={{ y: -80, opacity: 0 }}
        animate={{
          y: isVisible ? 0 : -80,
          opacity: 1,
        }}
        transition={{
          y: {
            type: "spring",
            stiffness: 200,
            damping: 25,
            mass: 0.5,
          },
          opacity: { duration: 0.4 },
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="relative z-99 w-full max-w-full"
      >
        <WrappedComponent />
      </m.div>
    );
  };
}
