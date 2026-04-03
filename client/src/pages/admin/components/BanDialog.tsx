import { useTranslation } from "react-i18next";
import * as React from "react";
import { Ban, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/pages/settings/SettingsContext";
import {
  getDialogClasses,
  getDialogFooterClasses,
  getTextColor,
  getSubtextColor,
  getTextShadow,
  getBackgroundClasses,
  getButtonClasses,
  getInputClasses,
  cn,
} from "@/lib/utils";
import type { AdminUserDTO } from "@/hooks/useAdmin";
import BanPresetCard from "./BanPresetCard";
import BanCustomRange from "./BanCustomRange";
import { useBanDialogLogic } from "@/pages/admin/useBanDialogLogic";

// ─── Preset reasons ───────────────────────────────────────────────────────────

const PRESET_REASONS_KEYS = [
  "presetReasons.cheating",
  "presetReasons.harassment",
  "presetReasons.hateSpeech",
  "presetReasons.spam",
  "presetReasons.exploiting",
  "presetReasons.toxic",
  "presetReasons.impersonation",
  "presetReasons.nsfw",
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface BanDialogProps {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  user: AdminUserDTO;
  onConfirm: (type: "permanent" | "temporary", until?: string, reason?: string) => void;
  isLoading?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BanDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
  isLoading = false,
}: BanDialogProps) {
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode } = settings;
  const { t } = useTranslation("admin");

  const logic = useBanDialogLogic(open);

  // Translated reason chips — derived inside component so t() is available
  const PRESET_REASONS = PRESET_REASONS_KEYS.map((key) => t(`ban.${key}`));

  React.useEffect(() => {
    if (open) logic.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ─── Theming ────────────────────────────────────────────────────────────────

  const dialogClass = getDialogClasses(useLiquidGlass, useDarkMode);
  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const subtextColor = getSubtextColor(useLiquidGlass, useDarkMode);
  const textShadow = getTextShadow(useLiquidGlass, useDarkMode);
  const sectionBg = getBackgroundClasses(useLiquidGlass, useDarkMode, "light");
  const footerClass = getDialogFooterClasses(useLiquidGlass, useDarkMode);
  const inputClass = getInputClasses(useLiquidGlass, useDarkMode);

  const permanentSelected = logic.selectedPreset === "permanent";

  const permanentCardClass = permanentSelected
    ? getButtonClasses(useLiquidGlass, useDarkMode, "primary")
    : getButtonClasses(useLiquidGlass, useDarkMode, "secondary");

  const confirmClass = logic.canConfirm
    ? "bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-md"
    : cn(
        getButtonClasses(useLiquidGlass, useDarkMode, "secondary"),
        "opacity-40 cursor-not-allowed",
      );

  // ─── Reason chip styling ───────────────────────────────────────────────────

  const reasonChipClass = (reason: string) => {
    const active = logic.banReason === reason;
    return cn(
      "px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-150 select-none border",
      active
        ? getButtonClasses(useLiquidGlass, useDarkMode, "primary")
        : getButtonClasses(useLiquidGlass, useDarkMode, "secondary"),
    );
  };

  // ─── Confirm handler ───────────────────────────────────────────────────────

  const handleConfirm = () => {
    if (!logic.selectedPreset) return;
    const reason = logic.banReason.trim() || undefined;
    if (logic.selectedPreset === "permanent") {
      onConfirm("permanent", undefined, reason);
      return;
    }
    if (!logic.customEnd) return;
    onConfirm("temporary", logic.customEnd.toISOString(), reason);
  };

  const permanentPreset = logic.PRESETS.find((p) => p.id === "permanent")!;
  const timeouts = logic.PRESETS.filter((p) => p.section === "timeout");
  const timedBans = logic.PRESETS.filter((p) => p.section === "ban" && p.id !== "permanent");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("flex w-full flex-col p-0 sm:max-w-2xl", dialogClass, textColor, textShadow)}
        showCloseButton
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className={cn("text-base font-semibold", textColor, textShadow)}>
            <span className="flex items-center gap-2">
              <Ban size={16} className="text-red-400" />
              {t("ban.title", { name: user.username || user.email })}
            </span>
          </DialogTitle>
          <p className={cn("mt-1 text-xs", subtextColor)}>{t("ban.description")}</p>
        </DialogHeader>

        <div className="flex flex-col gap-6 px-6 pb-0 lg:flex-row">
          {/* ── Left: presets + reason ─────────────────────────────────── */}
          <div className="flex flex-1 flex-col gap-4">
            {/* Permanent */}
            <div>
              <p
                className={cn("mb-2 text-xs font-semibold tracking-wider uppercase", subtextColor)}
              >
                Permanent
              </p>
              <div
                role="button"
                tabIndex={0}
                onClick={() => logic.handlePresetSelect(permanentPreset)}
                onKeyDown={(e) => e.key === "Enter" && logic.handlePresetSelect(permanentPreset)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
                  permanentCardClass,
                  permanentSelected ? "ring-1 ring-red-500/60" : "ring-1 ring-red-500/25",
                )}
              >
                <Ban size={16} className="shrink-0 text-red-400" />
                <div className="text-left">
                  <p className={cn("text-sm font-medium", textColor)}>{t("ban.permanentLabel")}</p>
                  <p className={cn("text-xs", subtextColor)}>{t("ban.permanentDescription")}</p>
                </div>
              </div>
            </div>

            {/* Timeouts */}
            <div>
              <p
                className={cn("mb-2 text-xs font-semibold tracking-wider uppercase", subtextColor)}
              >
                {t("ban.timeouts")}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {timeouts.map((preset) => (
                  <BanPresetCard
                    key={preset.id}
                    id={preset.id}
                    label={t(`ban.presets.${preset.id}`)}
                    description={t(`ban.presets.${preset.id}`)}
                    selected={logic.selectedPreset === preset.id}
                    onClick={() => logic.handlePresetSelect(preset)}
                  />
                ))}
              </div>
            </div>

            {/* Timed bans */}
            <div>
              <p
                className={cn("mb-2 text-xs font-semibold tracking-wider uppercase", subtextColor)}
              >
                {t("ban.timedBans")}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {timedBans.map((preset) => (
                  <BanPresetCard
                    key={preset.id}
                    id={preset.id}
                    label={t(`ban.presets.${preset.id}`)}
                    description={t(`ban.presets.${preset.id}`)}
                    selected={logic.selectedPreset === preset.id}
                    onClick={() => logic.handlePresetSelect(preset)}
                  />
                ))}
              </div>
            </div>

            {/* ── Reason ──────────────────────────────────────────────── */}
            <div className="flex flex-1 flex-col gap-2">
              <p
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase",
                  subtextColor,
                )}
              >
                <MessageSquare size={11} />
                Reason{" "}
                <span className={cn("font-normal normal-case", subtextColor)}>(optional)</span>
              </p>

              {/* Preset reason chips */}
              <div className={cn("flex flex-col gap-3 rounded-xl p-3", sectionBg)}>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => logic.setBanReason(logic.banReason === reason ? "" : reason)}
                      className={reasonChipClass(reason)}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                {/* Custom message textarea */}
                <div className="flex flex-col gap-1">
                  <label className={cn("text-xs", subtextColor)}>Custom message</label>
                  <textarea
                    rows={3}
                    placeholder={t("ban.customMessagePlaceholder")}
                    value={logic.banReason}
                    onChange={(e) => logic.setBanReason(e.target.value)}
                    className={cn(inputClass, "w-full resize-none text-xs leading-relaxed")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: custom range + calendar ─────────────────────────── */}
          <div className="flex flex-1 flex-col gap-3">
            <div>
              <p
                className={cn("mb-2 text-xs font-semibold tracking-wider uppercase", subtextColor)}
              >
                Custom Range
              </p>
              <BanCustomRange
                from={logic.customStart}
                to={logic.customEnd}
                onStartChange={(d) => logic.handleStartChange(d)}
                onEndChange={(d) => logic.handleEndChange(d)}
                onCalendarSelect={(r) => logic.handleCalendarSelect(r)}
                hideCalendar={permanentSelected}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={cn("mx-6 mb-6", footerClass)}>
          <div className="flex flex-col justify-end gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className={cn(getButtonClasses(useLiquidGlass, useDarkMode, "secondary"), textColor)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!logic.canConfirm || isLoading}
              className={cn("transition-all duration-200", confirmClass)}
            >
              {isLoading ? t("ban.confirming") : t("ban.confirm")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
