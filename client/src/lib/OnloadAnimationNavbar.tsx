import { useNavbarContext } from "@/context/NavbarContextUtils";
import { useEffect, useState, useRef, type ComponentType } from "react";

export function WithOnloadAnimation(WrappedComponent: ComponentType) {
  return function OnloadAnimation() {
    const [hidden, setHidden] = useState(false);
    const { isDropdownHovering, setIsDropdownHovering } = useNavbarContext();
    const isFreshMountRef = useRef(true);

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

    // Use fresh mount state to override isDropdownHovering during animation
    const shouldLockNavbar = !isFreshMountRef.current && isDropdownHovering;

    return (
      <nav
        className={`z-99 absolute hover:top-0 transition-all delay-150 duration-150 ease-in-out max-w-full w-full ${
          hidden && !shouldLockNavbar ? "-top-17" : "top-0"
        }`}
      >
        <div>
          <WrappedComponent />
        </div>
      </nav>
    );
  };
}
