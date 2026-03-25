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
import { CardAnimation } from "@/lib/miscAnimations/OnloadAnimationCard";
import { useSettings } from "../settings/settingsLogic/SettingsContext";
import { AuthContext } from "@/context/AuthContext";
import { NotFoundPage } from "@/components/pages/mainPages/NotFoundPage";
import AdminPageContent from "./adminComponents/AdminPageContent";
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  if (!isAdmin) {
    return <NotFoundPage />;
  }

  return (
    <div
      className={`min-h-screen w-full self-start flex flex-col items-center ${textColor}`}
    >
      <div className="w-full">
        <Navbar />
      </div>
      {settings.useAnimations ? (
        <CardAnimation
          className="z-0 flex-1 w-full px-4 sm:px-6 lg:px-10 pt-20 xl:pt-0 flex items-start xl:items-center justify-center"
          onAnimationComplete={handleAnimationComplete}
        >
          <AdminPageContent animReady={animDone} />
        </CardAnimation>
      ) : (
        <div className="z-0 flex-1 w-full px-4 sm:px-6 lg:px-10 pt-20 xl:pt-0 flex items-start xl:items-center justify-center">
          <AdminPageContent animReady={true} />
        </div>
      )}
    </div>
  );
}
