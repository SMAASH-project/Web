import { useContext, useState, useCallback } from "react";
import Navbar from "@/components/nav/Navbar";
import { CardAnimation } from "@/animations/CardAnimation";
import { useSettings } from "@/pages/settings/SettingsContext";
import { AuthContext } from "@/context/AuthContext";
import { NotFoundPage } from "@/pages/NotFoundPage";
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-white" />
      </div>
    );
  }

  if (!isAdmin && !isSupport) {
    return <NotFoundPage />;
  }

  return (
    <div className={`flex h-screen w-full flex-col overflow-hidden ${textColor}`}>
      <Navbar />
      {settings.useAnimations ? (
        <CardAnimation
          className="z-0 flex w-full flex-1 items-stretch justify-center overflow-hidden px-4 pt-26 pb-8 sm:px-6 lg:px-8"
          onAnimationComplete={handleAnimationComplete}
        >
          <DebugPageContent animReady={animDone} />
        </CardAnimation>
      ) : (
        <div className="z-0 flex w-full flex-1 items-stretch justify-center overflow-hidden px-4 pt-26 pb-8 sm:px-6 lg:px-8">
          <DebugPageContent animReady={true} />
        </div>
      )}
    </div>
  );
}
