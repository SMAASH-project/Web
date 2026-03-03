import { useContext, useRef } from "react";
import { ColorContext } from "./components/pages/profileDependents/settings/settingsLogic/color/ColorContext";
import { useSettings } from "./components/pages/profileDependents/settings/settingsLogic/SettingsContext";
import { useColorAnimation } from "./lib/miscAnimations/ColorInterpolation";

interface WrapperProps {
  children: React.ReactNode;
}

export function Wrapper({ children }: WrapperProps) {
  const context = useContext(ColorContext);
  const { settings } = useSettings();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const colorLeft = context?.colorLeft || "#616161";
  const colorMiddle = context?.colorMiddle || "#000000";
  const colorRight = context?.colorRight || "#616161";

  const currentGradient = `linear-gradient(to right, ${colorLeft}, ${colorMiddle}, ${colorRight})`;

  // Use the animation hook for smooth color transitions
  useColorAnimation({
    elementRef: wrapperRef as React.RefObject<HTMLDivElement>,
    gradient: currentGradient,
    duration: 0.6,
    useAnimation: settings.useAnimations,
  });

  return (
    <div
      ref={wrapperRef}
      className="text-white w-screen min-h-screen absolute top-0 left-0 flex items-center justify-center"
      style={{
        backgroundImage: currentGradient,
        transition: settings.useAnimations
          ? "none"
          : "background-image 0.6s ease-in-out",
      }}
    >
      {children}
    </div>
  );
}
