import { useEffect, useState, type ComponentType } from "react";

export function WithOnloadAnimation(WrappedComponent: ComponentType) {
  return function OnloadAnimation() {
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
      // keep navbar visible on load, then hide after 1.2s
      const timer = setTimeout(() => {
        setHidden(true);
      }, 1200);

      return () => clearTimeout(timer);
    }, []);

    return (
      <nav
        className={`z-99 absolute hover:top-0 transition-all delay-150 duration-150 ease-in-out max-w-full w-full ${
          hidden ? "-top-17" : "top-0"
        }`}
      >
        <div>
          <WrappedComponent />
        </div>
      </nav>
    );
  };
}
