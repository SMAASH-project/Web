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
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-white" />
      </div>
    );
  }

  if (!isAdmin) {
    return <NotFoundPage />;
  }

  // h-dvh + overflow-y-auto on the inner container means content scrolls within
  // the area below the spacer — it can never scroll behind the fixed navbar.
  const contentClass =
    "z-0 flex w-full flex-col items-center px-3 py-4 pb-8 sm:px-6 sm:py-5 lg:px-10";

  return (
    <div className={`flex h-dvh w-full flex-col ${textColor}`}>
      <Navbar />
      {/* Physical spacer matching the fixed navbar height.
          The scrollable container starts here, so content never slides under the navbar. */}
      <div className="h-24 shrink-0" aria-hidden="true" />
      <div className="flex flex-1 overflow-y-auto">
        {settings.useAnimations ? (
          <CardAnimation className={contentClass} onAnimationComplete={handleAnimationComplete}>
            <AdminPageContent animReady={animDone} />
          </CardAnimation>
        ) : (
          <div className={contentClass}>
            <AdminPageContent animReady={true} />
          </div>
        )}
      </div>
    </div>
  );
}
