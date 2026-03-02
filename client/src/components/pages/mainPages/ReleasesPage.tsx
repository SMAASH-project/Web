import { Card } from "@/components/ui/card";
import Navbar from "../../nav/Navbar";
import { SelectOs } from "./releasesPageComponents/SelectOs";
import { useSettings } from "../profileDependents/settings/settingsLogic/SettingsContext";
import { useState } from "react";
import { Releases } from "./releasesPageComponents/Releases";

export function ReleasesPage() {
  const { settings } = useSettings();
  const [selectedOs, setSelectedOs] = useState("Windows");

  return (
    <div className="p-4">
      <Navbar />
      <Card
        className={`mt-4 p-10 ${
          settings.useLiquidGlass
            ? "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20"
            : "bg-gray-600 border-2 border-green-400"
        }`}
      >
        <SelectOs selectedOs={selectedOs} onSelectOs={setSelectedOs} />
        <Releases />
      </Card>
    </div>
  );
}
