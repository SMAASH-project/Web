import { useContext, useState, useCallback } from "react";
import Navbar from "@/components/nav/Navbar";
import { CardAnimation } from "@/lib/miscAnimations/OnloadAnimationCard";
import { useSettings } from "../settings/settingsLogic/SettingsContext";
import { AuthContext } from "@/context/AuthContext";
import { NotFoundPage } from "@/components/pages/mainPages/NotFoundPage";
import { DebugPageContent } from "./DebugPageContent";
import { getTextColor } from "@/lib/utils";

export function DebugPage() {
  const { isAdmin, isSupport, isInitializing } = useContext(AuthContext);
  const { settings } = useSettings();
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);

  const [animDone, setAnimDone] = useState(false);
  const handleAnimationComplete = useCallback(() => setAnimDone(true), []);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  if (!isAdmin && !isSupport) {
    return <NotFoundPage />;
  }

  return (
    <div
      className={`h-screen w-full flex flex-col overflow-hidden ${textColor}`}
    >
      <Navbar />
      {settings.useAnimations ? (
        <CardAnimation
          className="z-0 flex-1 w-full px-4 sm:px-6 lg:px-8 pt-26 pb-8 flex items-stretch justify-center overflow-hidden"
          onAnimationComplete={handleAnimationComplete}
        >
          <DebugPageContent animReady={animDone} />
        </CardAnimation>
      ) : (
        <div className="z-0 flex-1 w-full px-4 sm:px-6 lg:px-8 pt-26 pb-8 flex items-stretch justify-center overflow-hidden">
          <DebugPageContent animReady={true} />
        </div>
      )}
    </div>
  );
}
