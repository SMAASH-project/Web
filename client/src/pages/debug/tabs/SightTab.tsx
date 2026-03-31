import { useEffect, useState } from "react";
import { Zap, Eye, Layers, Palette, BellRing, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useDebugSettings } from "@/hooks/useDebugSettings";
import { toast } from "@/lib/toast";
import { Section, InfoRow } from "./shared";
import { useTranslation } from "react-i18next";

const SPEEDS = [0.25, 0.5, 1, 2, 4] as const;

const CSS_VARS = [
  "--theme-accent",
  "--theme-accent-hover",
  "--theme-accent-soft",
  "--theme-nav-border",
  "--theme-nav-shadow",
] as const;

const NAV_PILLS = [
  { value: "auto", key: "navAuto" },
  { value: "show", key: "navShow" },
  { value: "hide", key: "navHide" },
] as const;

export function SightTab({
  textColor,
  subtextColor,
  panelBg,
}: {
  textColor: string;
  subtextColor: string;
  panelBg: string;
}) {
  const { settings, update } = useDebugSettings();
  const { t } = useTranslation("debug");
  const [cssVars, setCssVars] = useState<Record<string, string>>({});

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const resolved: Record<string, string> = {};
    for (const v of CSS_VARS) {
      resolved[v] = style.getPropertyValue(v).trim() || "—";
    }
    setCssVars(resolved);
  }, []);

  const pillBase = `text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer`;
  const pillActive = `bg-white/20 ${textColor}`;
  const pillInactive = `${subtextColor} hover:bg-white/10`;

  const row = (label: string, value: boolean, key: keyof typeof settings) => (
    <div className="flex items-center justify-between py-1.5 border-b border-current/5 last:border-0">
      <span className={`text-xs ${subtextColor}`}>{label}</span>
      <Switch checked={value} onCheckedChange={(v) => update({ [key]: v })} />
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-min">

      {/* ── Animation ─────────────────────────────────────────────────── */}
      <Section title={t("sight.animation.title")} icon={<Zap size={11} />} panelBg={panelBg} subtextColor={subtextColor}>
        <div className="flex flex-col gap-2 py-1">
          {/* Speed picker */}
          <div className="flex gap-1 flex-wrap">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => update({ animationSpeed: s })}
                className={`${pillBase} ${settings.animationSpeed === s ? pillActive : pillInactive}`}
              >
                {s}×
              </button>
            ))}
          </div>
          <p className={`text-[10px] leading-tight ${subtextColor}`}>
            {t("sight.animation.speedNote")}
          </p>

          {/* Force Replay */}
          <div className="flex items-center justify-between pt-1 border-t border-current/5">
            <span className={`text-xs ${subtextColor}`}>{t("sight.animation.forceReplay")}</span>
            <button
              onClick={() => window.location.reload()}
              className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${subtextColor} hover:bg-white/10 transition-colors`}
            >
              <RefreshCw size={10} /> {t("sight.animation.reload")}
            </button>
          </div>

          {/* Navbar override */}
          <div className="flex items-center justify-between pt-1 border-t border-current/5">
            <span className={`text-xs ${subtextColor}`}>{t("sight.animation.navbar")}</span>
            <div className="flex gap-1">
              {NAV_PILLS.map(({ value, key }) => (
                <button
                  key={value}
                  onClick={() => update({ navbarOverride: value })}
                  className={`${pillBase} ${settings.navbarOverride === value ? pillActive : pillInactive}`}
                >
                  {t(`sight.animation.${key}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Visual ────────────────────────────────────────────────────── */}
      <Section title={t("sight.visual.title")} icon={<Eye size={11} />} panelBg={panelBg} subtextColor={subtextColor}>
        {row(t("sight.visual.disableBlur"), settings.noBackdropBlur, "noBackdropBlur")}
        {row(t("sight.visual.layoutBorders"), settings.layoutBorders, "layoutBorders")}
        {row(t("sight.visual.elementInspector"), settings.elementInspector, "elementInspector")}
      </Section>

      {/* ── Overlays ──────────────────────────────────────────────────── */}
      <Section title={t("sight.overlays.title")} icon={<Layers size={11} />} panelBg={panelBg} subtextColor={subtextColor}>
        {row(t("sight.overlays.fps"), settings.showFps, "showFps")}
        {row(t("sight.overlays.scroll"), settings.showScrollPos, "showScrollPos")}
      </Section>

      {/* ── Toast Test ────────────────────────────────────────────────── */}
      <Section title={t("sight.toast.title")} icon={<BellRing size={11} />} panelBg={panelBg} subtextColor={subtextColor}>
        <div className="flex gap-2 pt-1 flex-wrap">
          <button
            onClick={() => toast.success(t("sight.toast.msgSuccess"))}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
          >
            {t("sight.toast.success")}
          </button>
          <button
            onClick={() => toast.error(t("sight.toast.msgError"))}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
          >
            {t("sight.toast.error")}
          </button>
          <button
            onClick={() => toast.info(t("sight.toast.msgInfo"))}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
          >
            {t("sight.toast.info")}
          </button>
        </div>
      </Section>

      {/* ── CSS Variables ─────────────────────────────────────────────── */}
      <Section title={t("sight.cssVars.title")} icon={<Palette size={11} />} panelBg={panelBg} subtextColor={subtextColor}>
        {CSS_VARS.map((v) => (
          <InfoRow
            key={v}
            label={v}
            value={cssVars[v] ?? "…"}
            mono
            textColor={textColor}
            subtextColor={subtextColor}
          />
        ))}
      </Section>

    </div>
  );
}
