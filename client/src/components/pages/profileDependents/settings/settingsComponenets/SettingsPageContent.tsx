import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { memo, useCallback, useContext, useMemo } from "react";
import { ColorContext } from "../settingsLogic/color/ColorContext";
import { useSettings } from "../settingsLogic/SettingsContext";
import { THEMES, applyTheme, type Theme } from "../settingsLogic/Themes";
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
} from "../settingsLogic/SettingsContext";
import type { ColorContextType } from "../settingsLogic/color/ColorContext";
// ─── Memoised sub-components ──────────────────────────────────────────────────

interface ClassBag {
  bg: string;
  text: string;
  shadow: string;
  btn: string;
  ring: string;
}

interface ThemeSectionProps {
  classes: ClassBag;
  context: ColorContextType | undefined;
  t: (k: string) => string;
}

const ThemeSection = memo(function ThemeSection({
  classes,
  context,
  t,
}: ThemeSectionProps) {
  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-6">
      <Label className={`${classes.text} ${classes.shadow}`}>
        {t("themes.title")}
      </Label>
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
      <div className="flex items-center justify-center gap-3">
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

interface AnimationSectionProps {
  classes: ClassBag;
  currentOverride: AnimationOverride;
  setAnimOverride: (key: AnimationOverride) => void;
}

const AnimationSection = memo(function AnimationSection({
  classes,
  currentOverride,
  setAnimOverride,
}: AnimationSectionProps) {
  return (
    <div className="flex flex-col items-center gap-4 pt-2 border-t border-white/10">
      <Label className={`${classes.text} ${classes.shadow}`}>
        Animation Override
      </Label>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          className={`cursor-pointer ${classes.btn} ${classes.shadow} ${currentOverride === null ? classes.ring : ""}`}
          onClick={() => setAnimOverride(null)}
        >
          ✨ Theme Default
        </Button>
        <Button
          className={`cursor-pointer ${classes.btn} ${classes.shadow} ${currentOverride === "none" ? classes.ring : ""}`}
          onClick={() => setAnimOverride("none")}
        >
          ✖ None
        </Button>
        {ALL_ANIMATION_KEYS.map((key: AnimationKey) => (
          <Button
            key={key}
            className={`cursor-pointer ${classes.btn} ${classes.shadow} ${currentOverride === key ? classes.ring : ""}`}
            onClick={() => setAnimOverride(key)}
          >
            {ANIMATION_LABELS[key]}
          </Button>
        ))}
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
    // Strip backdrop-blur during entry so the browser isn't resampling
    // a growing blur region every frame while the spring runs.
    const bg = animReady ? rawBg : rawBg.replace(/backdrop-blur-\S+/g, "");
    return {
      bg,
      text: getTextColor(settings.useLiquidGlass, settings.useDarkMode),
      shadow: getTextShadow(settings.useLiquidGlass, settings.useDarkMode),
      btn: getButtonClasses(settings.useLiquidGlass, settings.useDarkMode),
      ring: settings.useLiquidGlass
        ? settings.useDarkMode
          ? "ring-2 ring-white/60"
          : "ring-2 ring-black/40"
        : settings.useDarkMode
          ? "ring-2 ring-gray-300"
          : "ring-2 ring-gray-600",
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
      {/* Row 1: Visual + Themes + Language — staggered fade-in per section */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        {/* Visual Section — first in, no delay */}
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

        {/* Theme Section — 80 ms after visual */}
        <div style={sectionStyle(animReady, 80)} className="flex-1">
          <ThemeSection classes={classes} context={context} t={t} />
        </div>

        {/* Language Section — 160 ms after visual */}
        <div style={sectionStyle(animReady, 160)} className="flex-1">
          <LanguageSection
            classes={classes}
            language={settings.language}
            updateSetting={updateSetting}
            t={t}
          />
        </div>
      </div>

      {/* Animation Override — last in, 240 ms */}
      {settings.useAnimations && (
        <div style={sectionStyle(animReady, 240)}>
          <AnimationSection
            classes={classes}
            currentOverride={settings.animationOverride}
            setAnimOverride={setAnimOverride}
          />
        </div>
      )}
    </Card>
  );
});
