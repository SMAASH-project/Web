import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { LoadPost } from "@/lib/pageAnimations/newsPageAnimations/LoadPost";
import { RemoveReleaseButton } from "./RemoveReleaseButton";
import { DownloadReleaseButton } from "./DownloadReleaseButton";
import type { Release } from "@/types/PageTypes";
import { Package } from "lucide-react";

const VERSION_TYPE_COLORS: Record<string, string> = {
  major: "#3b82f6",
  minor: "#10b981",
  patch: "#f59e0b",
};

function getVersionType(version: string): string {
  const parts = version.split(".").map(Number);
  if (parts[1] === 0 && parts[2] === 0) return "major";
  if (parts[2] === 0) return "minor";
  return "patch";
}

interface ReleasesProps {
  selectedOs: string;
  visibleReleases: Release[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  hasMore: boolean;
  handleRemove: (id: string) => void;
}

export function Releases({
  selectedOs,
  visibleReleases,
  containerRef,
  sentinelRef,
  hasMore,
  handleRemove,
}: ReleasesProps) {
  const { settings } = useSettings();
  const IsAdmin = true; // Replace with actual admin check
  const glass = settings.useLiquidGlass;

  return (
    <div
      className="flex flex-col gap-3 w-full overflow-y-auto flex-1 pr-1"
      ref={containerRef}
    >
      {visibleReleases.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 mt-16 opacity-60">
          <Package className="w-12 h-12 text-white/40" />
          <p
            className={`text-white/60 text-base ${
              glass ? "[text-shadow:0_1px_3px_rgba(163,163,163,0.3)]" : ""
            }`}
          >
            No releases found for {selectedOs}.
          </p>
        </div>
      ) : (
        visibleReleases.map((release, index) => {
          const versionType = getVersionType(release.version);
          const accentColor = VERSION_TYPE_COLORS[versionType];

          const cardContent = (
            <Card
              className={`group relative overflow-hidden p-0 transition-all duration-200 ${
                glass
                  ? "bg-white/10 backdrop-blur-lg border border-white/15 shadow-lg shadow-black/5 hover:bg-white/15 hover:border-white/25"
                  : "bg-gray-800/80 border border-gray-700 hover:border-gray-600 hover:bg-gray-800"
              }`}
            >
              {/* Accent bar on left */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                style={{ backgroundColor: accentColor }}
              />

              <div className="flex items-center justify-between gap-4 py-4 pl-6 pr-5">
                {/* Left: version info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
                      glass ? "bg-white/10" : "bg-gray-700/60"
                    }`}
                  >
                    <Package className="w-5 h-5 text-white/70" />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-base font-semibold text-white tracking-tight ${
                          glass
                            ? "[text-shadow:0_1px_4px_rgba(163,163,163,0.4)]"
                            : ""
                        }`}
                      >
                        v{release.version}
                      </span>
                      <Badge
                        className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0"
                        style={{
                          backgroundColor: `${accentColor}20`,
                          color: accentColor,
                          border: `1px solid ${accentColor}40`,
                        }}
                      >
                        {versionType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {release.supports.map((os) => (
                        <span
                          key={os}
                          className="text-xs text-white/40 font-medium"
                        >
                          {os}
                        </span>
                      ))}
                      <span className="text-xs text-white/25">·</span>
                      <span
                        className={`text-xs text-white/40 ${
                          glass
                            ? "[text-shadow:0_1px_2px_rgba(163,163,163,0.2)]"
                            : ""
                        }`}
                      >
                        {formatDateTime(release.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-1.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                  <DownloadReleaseButton version={release.version} />
                  {IsAdmin && (
                    <RemoveReleaseButton
                      onConfirm={() => handleRemove(release.id)}
                    />
                  )}
                </div>
              </div>
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
      {/* Sentinel element observed by IntersectionObserver to trigger loading more */}
      {hasMore && <div ref={sentinelRef} className="h-1 w-full shrink-0" />}
    </div>
  );
}
