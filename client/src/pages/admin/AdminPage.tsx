/**
 * AdminPage — full user management panel for admins.
 *
 * Layout:
 *   Left panel  — scrollable user list + search bar
 *   Center      — selected user's account info + ban/unban controls
 *   Right panel — user's profiles, selectable; stats per profile
 *
 * Backend wiring status: see BACKEND_NOTES.md and src/hooks/useAdminHooks.ts
 * for the endpoints that still need to be implemented on the Go side.
 */

// Content moved to AdminPageContent.tsx

import { useContext, useState, useCallback } from "react";
import Navbar from "@/components/nav/Navbar";
import { CardAnimation } from "@/animations/CardAnimation";
import { useSettings } from "@/pages/settings/SettingsContext";
import { AuthContext } from "@/context/AuthContext";
import { NotFoundPage } from "@/pages/NotFoundPage";
import AdminPageContent from "./AdminPageContent";
import { getTextColor } from "@/lib/utils";

// ─── Page wrapper (auth guard) ────────────────────────────────────────────────

export function AdminPage() {
  const { isAdmin, isInitializing } = useContext(AuthContext);
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

  if (!isAdmin) {
    return <NotFoundPage />;
  }

  return (
    <div className={`flex min-h-screen w-full flex-col items-center self-start ${textColor}`}>
      <div className="w-full">
        <Navbar />
      </div>
      {settings.useAnimations ? (
        <CardAnimation
          className="z-0 flex w-full flex-1 items-start justify-center px-4 pt-20 sm:px-6 lg:px-10 xl:items-center xl:pt-0"
          onAnimationComplete={handleAnimationComplete}
        >
          <AdminPageContent animReady={animDone} />
        </CardAnimation>
      ) : (
        <div className="z-0 flex w-full flex-1 items-start justify-center px-4 pt-20 sm:px-6 lg:px-10 xl:items-center xl:pt-0">
          <AdminPageContent animReady={true} />
        </div>
      )}
    </div>
  );
}
