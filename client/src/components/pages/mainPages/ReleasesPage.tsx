import Navbar from "../../nav/Navbar";
import { SelectOs } from "./releasesPageComponents/SelectOs";
import { useSettings } from "../profileDependents/settings/settingsLogic/SettingsContext";
import { useState } from "react";
import { Releases } from "./releasesPageComponents/Releases";
import { AddRelease } from "./releasesPageComponents/AddRelease";
import { SearchRelease } from "./releasesPageComponents/SearchRelease";
import { useReleases } from "./releasesPageComponents/releasesPageLogic/useReleases";
import { getTextColor, getTextShadow, getSubtextColor } from "@/lib/utils";

export function ReleasesPage() {
  const { settings } = useSettings();
  const [selectedOs, setSelectedOs] = useState("iOS");
  const IsAdmin = true; // Replace with actual admin check

  const {
    allReleases,
    visibleReleases,
    containerRef,
    sentinelRef,
    hasMore,
    isLoading,
    handleCreate,
    handleRemove,
    handleSearch,
  } = useReleases(selectedOs);

  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const textShadow = getTextShadow(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const subtextColor = getSubtextColor(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );

  return (
    <div className="p-4 min-h-screen w-full self-start flex flex-col">
      <Navbar />
      <div className="mt-20 z-0 flex flex-col items-center justify-start gap-6 w-full max-w-4xl mx-auto pb-8">
        {/* Header section */}
        <div className="flex flex-col gap-5 w-full">
          {/* Title + OS selector row */}
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col gap-1">
              <h1
                className={`text-2xl font-bold ${textColor} tracking-tight ${textShadow}`}
              >
                Releases
              </h1>
              <p className={`text-sm ${subtextColor}`}>
                Browse and manage app releases
              </p>
            </div>
            <SelectOs selectedOs={selectedOs} onSelectOs={setSelectedOs} />
          </div>

          {/* Toolbar row */}
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1">
              <SearchRelease onSearch={handleSearch} />
            </div>
            {IsAdmin && (
              <AddRelease onCreate={handleCreate} allReleases={allReleases} />
            )}
          </div>
        </div>

        {/* Release list */}
        <Releases
          selectedOs={selectedOs}
          visibleReleases={visibleReleases}
          containerRef={containerRef}
          sentinelRef={sentinelRef}
          hasMore={hasMore}
          isLoading={isLoading}
          handleRemove={handleRemove}
        />
      </div>
    </div>
  );
}
