import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { memo, useCallback, useContext, useMemo } from "react";
import { ColorContext } from "@/pages/settings/ColorContext";
import { useSettings } from "@/pages/settings/SettingsContext";
import { THEMES, applyTheme, type Theme } from "@/pages/settings/Themes";
import { SettingToggle } from "./SettingToggle";
import { ThemePicker } from "./ThemePicker";
import {
  getBackgroundClasses,
  getTextColor,
  getTextShadow,
  getButtonClasses,
  sectionStyle,
} from "@/lib/utils";
import { useTranslation } from "react-i18next";
import {
  ALL_ANIMATION_KEYS,
  ANIMATION_LABELS,
  type AnimationKey,
} from "@/lib/animationTypes";
import {
  type AnimationOverride,
  type SettingsState,
} from "@/pages/settings/SettingsContext";
import type { ColorContextType } from "@/pages/settings/ColorContext";

// ─── Memoised sub-components ──────────────────────────────────────────────────

interface ClassBag {
  bg: string;
  text: string;
  shadow: string;
  btn: string;
  btnSm: string;
  ring: string;
}

interface ThemeSectionProps {
  classes: ClassBag;
  context: ColorContextType | undefined;
  t: (k: string) => string;
  showAnimations: boolean;
  currentOverride: AnimationOverride;
  setAnimOverride: (key: AnimationOverride) => void;
}

// ThemeSection now owns the animation override row — it lives directly below
// the theme grid so the two concepts sit together and the bottom row is gone.
const ThemeSection = memo(function ThemeSection({
  classes,
  context,
  t,
  showAnimations,
  currentOverride,
  setAnimOverride,
}: ThemeSectionProps) {
  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-4">
      <Label className={`${classes.text} ${classes.shadow}`}>
        {t("themes.title")}
      </Label>

      {/* Theme preset grid */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {THEMES.map((theme: Theme) => (
          <Button
            key={theme.name}
            className={`cursor-pointer ${classes.btn} ${classes.shadow}`}
            onClick={() => applyTheme(theme, context)}
          >
            {theme.name}
          </Button>
        ))}
      </div>

      {/* Animation override — inline under themes, only when animations enabled */}
      {showAnimations && (
        <div className="w-full">
          <Label
            className={`block text-center mb-2 ${classes.text} ${classes.shadow}`}
          >
            Animation
          </Label>
          <div className="flex flex-wrap justify-center gap-1.5">
            {/* Theme Default */}
            <Button
              className={`cursor-pointer text-xs px-2.5 py-1 h-auto ${classes.btnSm} ${classes.shadow} ${currentOverride === null ? classes.ring : ""}`}
              onClick={() => setAnimOverride(null)}
            >
              Default
            </Button>
            {/* None */}
            <Button
              className={`cursor-pointer text-xs px-2.5 py-1 h-auto ${classes.btnSm} ${classes.shadow} ${currentOverride === "none" ? classes.ring : ""}`}
              onClick={() => setAnimOverride("none")}
            >
              None
            </Button>
            {/* Each animation key */}
            {ALL_ANIMATION_KEYS.map((key: AnimationKey) => (
              <Button
                key={key}
                className={`cursor-pointer text-xs px-2.5 py-1 h-auto ${classes.btnSm} ${classes.shadow} ${currentOverride === key ? classes.ring : ""}`}
                onClick={() => setAnimOverride(key)}
              >
                {ANIMATION_LABELS[key]}
              </Button>
            ))}
          </div>
        </div>
      )}

      <ThemePicker />
    </div>
  );
});

interface LanguageSectionProps {
  classes: ClassBag;
  language: SettingsState["language"];
  updateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => void;
  t: (k: string) => string;
}

const LanguageSection = memo(function LanguageSection({
  classes,
  language,
  updateSetting,
  t,
}: LanguageSectionProps) {
  const setEn = useCallback(
    () => updateSetting("language", "en"),
    [updateSetting],
  );
  const setHu = useCallback(
    () => updateSetting("language", "hu"),
    [updateSetting],
  );

  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-6">
      <Label className={`${classes.text} ${classes.shadow}`}>
        {t("language.title")}
      </Label>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Button
          className={`cursor-pointer ${classes.btn} ${classes.shadow} ${language === "en" ? classes.ring : ""}`}
          onClick={setEn}
        >
          🇬🇧 {t("language.en")}
        </Button>
        <Button
          className={`cursor-pointer ${classes.btn} ${classes.shadow} ${language === "hu" ? classes.ring : ""}`}
          onClick={setHu}
        >
          🇭🇺 {t("language.hu")}
        </Button>
      </div>
    </div>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────

export const SettingsPageContent = memo(function SettingsPageContent({
  animReady = true,
}: {
  animReady?: boolean;
}) {
  const { settings, updateSetting } = useSettings();
  const context = useContext(ColorContext);
  const { t } = useTranslation("settings");

  const classes = useMemo<ClassBag>(() => {
    const rawBg = getBackgroundClasses(
      settings.useLiquidGlass,
      settings.useDarkMode,
    );
    const bg = animReady ? rawBg : rawBg.replace(/backdrop-blur-\S+/g, "");
    const btn = getButtonClasses(settings.useLiquidGlass, settings.useDarkMode);
    // btnSm reuses the same base class — sizing is controlled in JSX via text-xs/px/py
    const btnSm = btn;
    const ring = settings.useLiquidGlass
      ? settings.useDarkMode
        ? "ring-2 ring-white/60"
        : "ring-2 ring-black/40"
      : settings.useDarkMode
        ? "ring-2 ring-gray-300"
        : "ring-2 ring-gray-600";
    return {
      bg,
      text: getTextColor(settings.useLiquidGlass, settings.useDarkMode),
      shadow: getTextShadow(settings.useLiquidGlass, settings.useDarkMode),
      btn,
      btnSm,
      ring,
    };
  }, [settings.useLiquidGlass, settings.useDarkMode, animReady]);

  const setAnimOverride = useCallback(
    (key: AnimationOverride) => updateSetting("animationOverride", key),
    [updateSetting],
  );

  return (
    <Card
      className={`z-0 flex flex-col w-full max-w-6xl p-6 sm:p-8 lg:p-10 gap-8 ${classes.bg}`}
    >
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        {/* Visual — first in, no delay */}
        <div
          className="flex-1 flex items-center justify-center flex-col gap-6"
          style={sectionStyle(animReady, 0)}
        >
          <Label className={`${classes.text} ${classes.shadow}`}>
            {t("visual.title")}
          </Label>
          <div className="w-full flex justify-center">
            <SettingToggle />
          </div>
        </div>

        {/* Themes + Animation inline — 80 ms */}
        <div
          style={sectionStyle(animReady, 80)}
          className="flex-1 flex items-center justify-center flex-col gap-6"
        >
          <ThemeSection
            classes={classes}
            context={context}
            t={t}
            showAnimations={settings.useAnimations}
            currentOverride={settings.animationOverride}
            setAnimOverride={setAnimOverride}
          />
        </div>

        {/* Language — 160 ms */}
        <div
          style={sectionStyle(animReady, 160)}
          className="flex-1 flex items-center justify-center flex-col gap-6"
        >
          <LanguageSection
            classes={classes}
            language={settings.language}
            updateSetting={updateSetting}
            t={t}
          />
        </div>
      </div>
    </Card>
  );
});
