import Navbar from "../../nav/Navbar";
import { SelectOs } from "./releasesPageComponents/SelectOs";
import { useSettings } from "../profileDependents/settings/settingsLogic/SettingsContext";
import { useState } from "react";
import { Releases } from "./releasesPageComponents/Releases";
import { Label } from "@/components/ui/label";
import { ButtonGroup } from "@/components/ui/button-group";
import { AddRelease } from "./releasesPageComponents/AddRelease";
import { SearchRelease } from "./releasesPageComponents/SearchRelease";
import { useReleases } from "./releasesPageComponents/releasesPageLogic/useReleases";

export function ReleasesPage() {
  const { settings } = useSettings();
  const [selectedOs, setSelectedOs] = useState("iOS");
  const IsAdmin = true; // Replace with actual admin check

  const {
    allReleases,
    visibleReleases,
    containerRef,
    handleCreate,
    handleRemove,
    handleSearch,
  } = useReleases(selectedOs);

  return (
    <div className="p-4 h-screen overflow-hidden flex flex-col">
      <Navbar />
      <div className="mt-20 z-0 flex flex-col items-center justify-start gap-5 flex-1 overflow-hidden">
        <span className="flex flex-row w-full justify-between items-center">
          <ButtonGroup
            orientation="horizontal"
            className={`text-white ${
              settings.useLiquidGlass
                ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)] rounded-lg bg-white/30"
                : ""
            }`}
          >
            {IsAdmin ? (
              <>
                <AddRelease onCreate={handleCreate} allReleases={allReleases} />
                <SearchRelease onSearch={handleSearch} />
              </>
            ) : (
              <SearchRelease onSearch={handleSearch} />
            )}
          </ButtonGroup>
          <span className="flex flex-row items-center gap-2">
            <Label
              className={`text-white text-lg ${
                settings.useLiquidGlass
                  ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
                  : ""
              } text-center`}
            >
              Releases — {selectedOs}
            </Label>
            <SelectOs selectedOs={selectedOs} onSelectOs={setSelectedOs} />
          </span>
        </span>
        <Releases
          selectedOs={selectedOs}
          visibleReleases={visibleReleases}
          containerRef={containerRef}
          handleRemove={handleRemove}
        />
      </div>
    </div>
  );
}
