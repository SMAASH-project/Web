import { useRef, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/pages/settings/SettingsContext";
import { UpdateSheet } from "./UpdateSheet";
import { useTranslation } from "react-i18next";
import {
  ExternalLink,
  Coins,
  Clock,
  Hash,
  Swords,
  Trophy,
  TrendingUp,
  History,
} from "lucide-react";
import {
  cn,
  getLiquidGlassClasses,
  getLiquidGlassTextShadow,
  getBackgroundClasses,
  getTextColor,
  getSubtextColor,
  getTextShadow,
  sectionStyle,
} from "@/lib/utils";
import { useProfiles } from "@/pages/profile-selector/useProfiles";
import { useUploadProfilePictureMutation } from "@/hooks/useQueryHooks";

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  valueClass,
  dimmed,
  panelBg,
  textColor,
  subtextColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  dimmed?: boolean;
  panelBg: string;
  textColor: string;
  subtextColor: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1 rounded-xl p-3", panelBg, dimmed && "opacity-40")}>
      <p className={cn("flex items-center gap-1 text-xs", subtextColor)}>
        {icon}
        {label}
      </p>
      <p className={cn("text-sm font-semibold", valueClass ?? textColor)}>{value}</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfilePageContent({ animReady = true }: { animReady?: boolean }) {
  const pfpinputRef = useRef<HTMLInputElement>(null);
  const { selectedProfile } = useProfiles();
  const uploadProfilePictureMutation = useUploadProfilePictureMutation();
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const { t } = useTranslation("profile");

  const username = selectedProfile?.name ?? "—";
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode } = settings;

  useEffect(() => {
    return () => {
      if (localPreview?.startsWith("blob:")) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProfile?.id) return;

    // Reset value immediately so selecting the same file again fires onChange.
    e.target.value = "";

    const blobUrl = URL.createObjectURL(file);
    setLocalPreview(blobUrl);
    try {
      await uploadProfilePictureMutation.mutateAsync({
        profileId: selectedProfile.id,
        file,
      });
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
      setLocalPreview(null);
    }
  };

  // ─── Theming ────────────────────────────────────────────────────────────────

  const rawCardBg = useLiquidGlass
    ? getLiquidGlassClasses(useLiquidGlass, useDarkMode)
    : getBackgroundClasses(useLiquidGlass, useDarkMode);
  const cardBg = animReady ? rawCardBg : rawCardBg.replace(/backdrop-blur-\S+/g, "");

  const panelBg = getBackgroundClasses(useLiquidGlass, useDarkMode, "light");
  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const subtextColor = getSubtextColor(useLiquidGlass, useDarkMode);
  const textShadow = getTextShadow(useLiquidGlass, useDarkMode);

  const sepClass = useLiquidGlass
    ? useDarkMode
      ? "bg-white/10"
      : "bg-black/10"
    : useDarkMode
      ? "bg-gray-700"
      : "bg-gray-200";

  const avatarSrc = localPreview ?? selectedProfile?.avatar ?? "./src/assets/SlimeArt.png";

  // ─── Derived stats ───────────────────────────────────────────────────────
  const coins = selectedProfile?.coins?.toLocaleString() ?? "—";
  const lastSeen = selectedProfile?.last_login
    ? new Date(selectedProfile.last_login).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
  const profileId = selectedProfile?.id ? `#${selectedProfile.id}` : "—";

  return (
    <Card
      className={cn(
        "z-0 flex w-full max-w-6xl flex-col lg:flex-row",
        "gap-6 p-6 sm:p-8 lg:gap-8 lg:p-10",
        cardBg,
      )}
    >
      {/* ═══ Left — avatar + name + edit ═══════════════════════════════════ */}
      <div
        className="flex flex-col items-center justify-center gap-5 lg:w-52 lg:shrink-0"
        style={sectionStyle(animReady, 0)}
      >
        <div>
          <input type="file" ref={pfpinputRef} hidden accept="image/*" onChange={onFileChange} />
          <div onClick={() => pfpinputRef.current?.click()}>
            <Avatar
              size="lg"
              className={cn(
                "cursor-pointer text-white",
                getLiquidGlassClasses(useLiquidGlass, useDarkMode),
                getLiquidGlassTextShadow(useLiquidGlass, useDarkMode),
              )}
            >
              <AvatarImage src={avatarSrc} alt={username} />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-gray-700/70 opacity-0 transition-opacity duration-150 group-hover/avatar:opacity-100"
              >
                <ExternalLink className="size-4 text-white opacity-100" />
              </span>
              <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="text-center">
          <p className={cn("text-lg leading-tight font-semibold", textColor, textShadow)}>
            {username}
          </p>
          {selectedProfile?.coins !== undefined && (
            <p className={cn("mt-1 flex items-center justify-center gap-1 text-xs", subtextColor)}>
              <Coins size={11} />
              {coins} {t("common:common.coins")}
            </p>
          )}
        </div>

        <UpdateSheet />
      </div>

      {/* Vertical divider (desktop) / horizontal (mobile) */}
      <Separator
        orientation="vertical"
        className={cn("hidden w-px self-stretch lg:block", sepClass)}
      />
      <Separator className={cn("block lg:hidden", sepClass)} />

      {/* ═══ Center — stats ════════════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col gap-4" style={sectionStyle(animReady, 80)}>
        <p className={cn("text-xs font-semibold tracking-wider uppercase", subtextColor)}>
          {t("page.stats")}
        </p>

        {/* Live stats — data we already have */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            icon={<Coins size={11} />}
            label={t("stats.coins")}
            value={coins}
            panelBg={panelBg}
            textColor={textColor}
            subtextColor={subtextColor}
          />
          <StatCard
            icon={<Clock size={11} />}
            label={t("stats.lastSeen")}
            value={lastSeen}
            panelBg={panelBg}
            textColor={textColor}
            subtextColor={subtextColor}
          />
          <StatCard
            icon={<Hash size={11} />}
            label={t("stats.profileId")}
            value={profileId}
            panelBg={panelBg}
            textColor={textColor}
            subtextColor={subtextColor}
          />
        </div>

        {/*
         * TODO: BACKEND — The following stats require a match history endpoint.
         * The Match, MatchParticipation, and Character models exist in the backend
         * but there is no controller or API route for them.
         *
         * Needed: GET /api/profiles/:id/matches
         * Returns: array of { match_id, level_name, result, character_name,
         *          started_at, ended_at, network_status }
         *
         * Once the endpoint exists:
         *   1. Add useProfileMatchesQuery(profileId) to useProfileHooks.ts
         *   2. Derive wins, losses, win rate, and total matches from the response
         *   3. Replace the dimmed placeholder cards below with real values
         *   4. Populate the Match History section on the right
         */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<Trophy size={11} />}
            label={t("stats.wins")}
            value="—"
            dimmed
            panelBg={panelBg}
            textColor={textColor}
            subtextColor={subtextColor}
          />
          <StatCard
            icon={<Swords size={11} />}
            label={t("stats.losses")}
            value="—"
            dimmed
            panelBg={panelBg}
            textColor={textColor}
            subtextColor={subtextColor}
          />
          <StatCard
            icon={<TrendingUp size={11} />}
            label={t("stats.winRate")}
            value="—"
            dimmed
            panelBg={panelBg}
            textColor={textColor}
            subtextColor={subtextColor}
          />
          <StatCard
            icon={<History size={11} />}
            label={t("stats.matches")}
            value="—"
            dimmed
            panelBg={panelBg}
            textColor={textColor}
            subtextColor={subtextColor}
          />
        </div>
      </div>

      {/* Vertical divider (desktop) */}
      <Separator
        orientation="vertical"
        className={cn("hidden w-px self-stretch lg:block", sepClass)}
      />
      <Separator className={cn("block lg:hidden", sepClass)} />

      {/* ═══ Right — match history ══════════════════════════════════════════ */}
      <div className="flex min-w-0 flex-1 flex-col gap-4" style={sectionStyle(animReady, 160)}>
        <p className={cn("text-xs font-semibold tracking-wider uppercase", subtextColor)}>
          {t("page.matchHistory")}
        </p>

        {/*
         * TODO: BACKEND — Match history requires GET /api/profiles/:id/matches
         * See the TODO comment in the Stats section above for the full spec.
         * Replace the empty state below with a mapped list of match rows.
         */}
        <div
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-3 rounded-xl py-10",
            panelBg,
          )}
        >
          <Swords size={28} className={cn("opacity-25", subtextColor)} />
          <p className={cn("text-sm font-medium opacity-50", subtextColor)}>
            {t("page.noMatches")}
          </p>
          <p className={cn("max-w-45 text-center text-xs opacity-40", subtextColor)}>
            {t("page.noMatchesSubtext")}
          </p>
        </div>
      </div>
    </Card>
  );
}
