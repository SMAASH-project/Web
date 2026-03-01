import { Card } from "@/components/ui/card";
import Navbar from "../../nav/Navbar";
import { SelectOs } from "./releasesPageComponents/SelectOs";
import { Label } from "@/components/ui/label";
import { useSettings } from "../profileDependents/settings/settingsLogic/SettingsContext";
import { useState } from "react";

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
        <Label
          className={`text-2xl font-bold mb-6 block ${
            settings.useLiquidGlass
              ? "text-white [text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
              : "text-white"
          }`}
        >
          Releases Page
        </Label>
        <SelectOs selectedOs={selectedOs} onSelectOs={setSelectedOs} />
      </Card>
    </div>
  );
}
