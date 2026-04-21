import { useSettings } from "@/pages/settings/SettingsContext";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatDateTime,
  getBackgroundClasses,
  getTextShadow,
  getTextColor,
  getSubtextColor,
} from "@/lib/utils";
import { LoadPost } from "@/animations/LoadPost";
import { motion } from "motion/react";
import { DownloadReleaseButton } from "./DownloadReleaseButton";
import type { Release } from "@/types/PageTypes";
import { Package, Loader2 } from "lucide-react";

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
  isLoading: boolean;
  /** Optional error message from the GitHub API fetch. */
  fetchError: string | null;
}

export function Releases({
  selectedOs,
  visibleReleases,
  containerRef,
  sentinelRef,
  hasMore,
  isLoading,
  fetchError,
}: ReleasesProps) {
  const { settings } = useSettings();
  const { t } = useTranslation("releases");
  const glass = settings.useLiquidGlass;
  const bgClass = getBackgroundClasses(settings.useLiquidGlass, settings.useDarkMode, "light");
  const textShadow = getTextShadow(settings.useLiquidGlass, settings.useDarkMode);
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const subtextColor = getSubtextColor(settings.useLiquidGlass, settings.useDarkMode);

  return (
    <div className="flex w-full flex-col gap-3" ref={containerRef}>
      {visibleReleases.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-3 opacity-60">
          <Package className={`h-12 w-12 ${subtextColor}`} />
          <p className={`${subtextColor} text-base ${textShadow}`}>
            {t("noResultsForOs", { os: selectedOs })}
          </p>
        </div>
      ) : (
        visibleReleases.map((release, index) => {
          const versionType = getVersionType(release.version);
          const accentColor = VERSION_TYPE_COLORS[versionType];

          const cardContent = (
            <Card
              className={`group relative overflow-hidden p-0 transition-all duration-200 ${bgClass} border shadow-lg ${
                glass
                  ? settings.useDarkMode
                    ? "border-black/15 shadow-black/20 hover:border-black/25"
                    : "border-white/15 shadow-black/5 hover:border-white/25"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              {/* Accent bar on left */}
              <div
                className="absolute top-0 bottom-0 left-0 w-1 rounded-l-lg"
                style={{ backgroundColor: accentColor }}
              />

              <div className="flex items-center justify-between gap-4 py-4 pr-5 pl-6">
                {/* Left: version info */}
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      glass
                        ? settings.useDarkMode
                          ? "bg-black/10"
                          : "bg-white/10"
                        : "bg-gray-700/60"
                    }`}
                  >
                    <Package className={`h-5 w-5 ${subtextColor}`} />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-base font-semibold ${textColor} tracking-tight ${textShadow}`}
                      >
                        v{release.version}
                      </span>
                      <Badge
                        className="px-2 py-0 text-[10px] font-semibold tracking-wider uppercase"
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
                        <span key={os} className={`text-xs ${subtextColor} font-medium`}>
                          {os}
                        </span>
                      ))}
                      <span className={`text-xs ${subtextColor}`}>·</span>
                      <span className={`text-xs ${subtextColor} ${textShadow}`}>
                        {formatDateTime(release.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex shrink-0 items-center gap-1.5 opacity-60 transition-opacity group-hover:opacity-100">
                  <DownloadReleaseButton
                    version={release.version}
                    downloadUrl={release.downloadUrls[selectedOs]}
                  />
                  {/* Downloads come from GitHub release assets.
                      Releases are managed on GitHub — there is no in-app
                      add/remove UI. To publish or retract a release, do so
                      on https://github.com/SMAASH-project/SMAASH/releases */}
                </div>
              </div>
            </Card>
          );

          const animatedCard = settings.useAnimations ? (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }}>
              {cardContent}
            </motion.div>
          ) : (
            cardContent
          );

          return settings.useAnimations ? (
            <LoadPost key={release.id} index={index}>
              {animatedCard}
            </LoadPost>
          ) : (
            <div key={release.id}>{animatedCard}</div>
          );
        })
      )}
      {/* Sentinel element observed by IntersectionObserver to trigger loading more */}
      {hasMore && (
        <div ref={sentinelRef} className="flex w-full shrink-0 items-center justify-center py-4">
          {isLoading && <Loader2 className={`h-5 w-5 ${subtextColor} animate-spin`} />}
        </div>
      )}
    </div>
  );
}
