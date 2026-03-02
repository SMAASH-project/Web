import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { LoadPost } from "@/lib/pageAnimations/newsPageAnimations/LoadPost";
import { ButtonGroup } from "@/components/ui/button-group";
import { RemoveReleaseButton } from "./RemoveReleaseButton";
import { DownloadReleaseButton } from "./DownloadReleaseButton";
import type { Release } from "@/types/PageTypes";

interface ReleasesProps {
  selectedOs: string;
  visibleReleases: Release[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  handleRemove: (id: string) => void;
}

export function Releases({
  selectedOs,
  visibleReleases,
  containerRef,
  handleRemove,
}: ReleasesProps) {
  const { settings } = useSettings();
  const IsAdmin = true; // Replace with actual admin check

  return (
    <div
      className="flex flex-col gap-5 w-full overflow-y-auto flex-1"
      ref={containerRef}
    >
      {visibleReleases.length === 0 ? (
        <Label
          className={`text-white text-lg ${
            settings.useLiquidGlass
              ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
              : ""
          } text-center mt-10`}
        >
          No releases found for {selectedOs}.
        </Label>
      ) : (
        visibleReleases.map((release, index) => {
          const cardContent = (
            <Card
              className={`flex flex-col gap-3 p-8 ${
                settings.useLiquidGlass
                  ? "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20"
                  : "bg-gray-600 border-2 border-green-400"
              }`}
            >
              <span className="flex flex-row w-full items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <Label
                    className={`text-white text-xl font-bold ${
                      settings.useLiquidGlass
                        ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
                        : ""
                    }`}
                  >
                    Version {release.version}
                  </Label>
                  <div className="flex flex-row gap-2">
                    {release.supports.map((os) => (
                      <Badge
                        key={os}
                        className={
                          os === "iOS"
                            ? "bg-blue-500/80 text-white"
                            : "bg-green-500/80 text-white"
                        }
                      >
                        {os}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Label
                    className={`text-white text-sm ${
                      settings.useLiquidGlass
                        ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
                        : ""
                    } italic text-right`}
                  >
                    {formatDateTime(release.createdAt)}
                  </Label>
                  <ButtonGroup>
                    <DownloadReleaseButton version={release.version} />
                    {IsAdmin && (
                      <RemoveReleaseButton
                        onConfirm={() => handleRemove(release.id)}
                      />
                    )}
                  </ButtonGroup>
                </div>
              </span>
            </Card>
          );

          return settings.useAnimations ? (
            <LoadPost key={release.id} index={index}>
              {cardContent}
            </LoadPost>
          ) : (
            <div key={release.id}>{cardContent}</div>
          );
        })
      )}
    </div>
  );
}
