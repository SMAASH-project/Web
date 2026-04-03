import Navbar from "@/components/nav/Navbar";
import { SelectOs } from "./components/SelectOs";
import { useSettings } from "@/pages/settings/SettingsContext";
import { useState } from "react";
import { Releases } from "./components/Releases";
import { SearchRelease } from "./components/SearchRelease";
import { useReleases } from "./useReleases";
import { getTextColor, getTextShadow, getSubtextColor } from "@/lib/utils";
import { useTranslation } from "react-i18next";

/**
 * Releases are sourced directly from GitHub:
 *   https://github.com/SMAASH-project/SMAASH/releases
 *
 * There is no in-app admin UI for adding or removing releases.
 * To publish a new version, create a GitHub release and attach:
 *   - An .apk (or .aab) asset for Android
 *   - An .ipa asset for iOS
 * See useReleases.ts for the asset naming convention.
 */
export function ReleasesPage() {
  const { settings } = useSettings();
  const [selectedOs, setSelectedOs] = useState("iOS");
  const { t } = useTranslation("releases");

  const {
    visibleReleases,
    containerRef,
    sentinelRef,
    hasMore,
    isLoading,
    fetchError,
    handleSearch,
  } = useReleases(selectedOs);

  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const textShadow = getTextShadow(settings.useLiquidGlass, settings.useDarkMode);
  const subtextColor = getSubtextColor(settings.useLiquidGlass, settings.useDarkMode);

  return (
    <div className="flex min-h-screen w-full flex-col self-start p-4">
      <Navbar />
      <div className="z-0 mx-auto mt-20 flex w-full max-w-4xl flex-col items-center justify-start gap-6 pb-8">
        {/* Header section */}
        <div className="flex w-full flex-col gap-5">
          {/* Title + OS selector row */}
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className={`text-2xl font-bold ${textColor} tracking-tight ${textShadow}`}>
                {t("title")}
              </h1>
              <p className={`text-sm ${subtextColor}`}>{t("subtitle")}</p>
            </div>
            <SelectOs selectedOs={selectedOs} onSelectOs={setSelectedOs} />
          </div>

          {/* GitHub API error banner */}
          {fetchError && (
            <div className="w-full rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400">
              {t("fetchError")}: {fetchError}
            </div>
          )}

          {/* Search bar */}
          <SearchRelease onSearch={handleSearch} />
        </div>

        {/* Release list */}
        <Releases
          selectedOs={selectedOs}
          visibleReleases={visibleReleases}
          containerRef={containerRef}
          sentinelRef={sentinelRef}
          hasMore={hasMore}
          isLoading={isLoading}
          fetchError={fetchError}
        />
      </div>
    </div>
  );
}
