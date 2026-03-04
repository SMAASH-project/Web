import { useNavbarContext } from "@/context/NavbarContextUtils";
import { useEffect, useState, useRef, type ComponentType } from "react";
import { useMediaQuery } from "@/components/nav/navLogic/useMediaQuery";

export function WithOnloadAnimation(WrappedComponent: ComponentType) {
  return function OnloadAnimation() {
    const [hidden, setHidden] = useState(false);
    const { isDropdownHovering, setIsDropdownHovering, isDropdownOpen } =
      useNavbarContext();
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
    const shouldLockNavbar =
      !isFreshMountRef.current && (isDropdownOpen || isDropdownHovering);

    return (
      <div
        className={`z-99 relative transition-all delay-150 duration-150 ease-in-out max-w-full w-full ${
          hidden && !shouldLockNavbar ? "-mt-14 hover:mt-0" : "mt-0"
        }`}
      >
        <WrappedComponent />
      </div>
    );
  };
}
