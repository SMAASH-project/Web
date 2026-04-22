import { Card } from "@/components/ui/card";
import gbFlag from "@/assets/flags/gb-f.svg?url";
import huFlag from "@/assets/flags/hu-f.svg?url";
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
import { ALL_ANIMATION_KEYS, ANIMATION_LABELS, type AnimationKey } from "@/lib/animationTypes";
import { type AnimationOverride, type SettingsState } from "@/pages/settings/SettingsContext";
import type { ColorContextType } from "@/pages/settings/ColorContext";
import { AnimatedPress } from "@/animations/AnimatedPress";

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
  currentOverride: AnimationOverride;
  setAnimOverride: (key: AnimationOverride) => void;
}

const ThemeSection = memo(function ThemeSection({
  classes,
  context,
  t,
  currentOverride,
  setAnimOverride,
}: ThemeSectionProps) {
  const colorLeft = context?.colorLeft ?? "";
  const colorMiddle = context?.colorMiddle ?? "";
  const colorRight = context?.colorRight ?? "";
  const customTheme = context?.customTheme ?? null;
  const effectMix = context?.effectMix ?? null;

  // Detect which preset theme (if any) matches current colors
  const activeThemeName = useMemo(() => {
    for (const theme of THEMES) {
      if (
        theme.colorLeft === colorLeft &&
        theme.colorMiddle === colorMiddle &&
        theme.colorRight === colorRight
      ) {
        return theme.name;
      }
    }
    return null;
  }, [colorLeft, colorMiddle, colorRight]);

  const isCustomThemeActive = useMemo(
    () =>
      customTheme !== null &&
      customTheme.colorLeft === colorLeft &&
      customTheme.colorMiddle === colorMiddle &&
      customTheme.colorRight === colorRight,
    [customTheme, colorLeft, colorMiddle, colorRight],
  );

  const hasEffectMix = effectMix !== null && Object.keys(effectMix).length > 0;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <Label className={`${classes.text} ${classes.shadow}`}>{t("themes.title")}</Label>

      {/* Theme preset grid */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {THEMES.map((theme: Theme) => (
          <AnimatedPress key={theme.name}>
            <Button
              className={`cursor-pointer ${classes.btn} ${classes.shadow} ${
                activeThemeName === theme.name ? classes.ring : ""
              }`}
              onClick={() => applyTheme(theme, context)}
            >
              {theme.name}
            </Button>
          </AnimatedPress>
        ))}
        {/* Custom saved theme button — only shown when one is saved */}
        {customTheme && (
          <AnimatedPress>
            <Button
              className={`cursor-pointer ${classes.btn} ${classes.shadow} ${
                isCustomThemeActive ? classes.ring : ""
              }`}
              onClick={() => {
                context?.setColorLeft(customTheme.colorLeft);
                context?.setColorMiddle(customTheme.colorMiddle);
                context?.setColorRight(customTheme.colorRight);
                context?.setAnimationKey(null);
              }}
            >
              {t("effect.custom")}
            </Button>
          </AnimatedPress>
        )}
      </div>

      {/* Effect picker */}
      <div className="w-full">
        <Label className={`mb-2 block text-center ${classes.text} ${classes.shadow}`}>
          {t("effect.title")}
        </Label>
        <div className="flex flex-wrap justify-center gap-1.5">
          {/* Theme Default */}
          <AnimatedPress>
            <Button
              className={`h-auto cursor-pointer px-2.5 py-1 text-xs ${classes.btnSm} ${classes.shadow} ${currentOverride === null ? classes.ring : ""}`}
              onClick={() => setAnimOverride(null)}
            >
              {t("effect.default")}
            </Button>
          </AnimatedPress>
          {/* None */}
          <AnimatedPress>
            <Button
              className={`h-auto cursor-pointer px-2.5 py-1 text-xs ${classes.btnSm} ${classes.shadow} ${currentOverride === "none" ? classes.ring : ""}`}
              onClick={() => setAnimOverride("none")}
            >
              {t("effect.none")}
            </Button>
          </AnimatedPress>
          {/* Custom mix — only shown when an effectMix is saved */}
          {hasEffectMix && (
            <AnimatedPress>
              <Button
                className={`h-auto cursor-pointer px-2.5 py-1 text-xs ${classes.btnSm} ${classes.shadow} ${currentOverride === "custom" ? classes.ring : ""}`}
                onClick={() => setAnimOverride("custom")}
              >
                {t("effect.custom")}
              </Button>
            </AnimatedPress>
          )}
          {/* Each animation key */}
          {ALL_ANIMATION_KEYS.map((key: AnimationKey) => (
            <AnimatedPress key={key}>
              <Button
                className={`h-auto cursor-pointer px-2.5 py-1 text-xs ${classes.btnSm} ${classes.shadow} ${currentOverride === key ? classes.ring : ""}`}
                onClick={() => setAnimOverride(key)}
              >
                {ANIMATION_LABELS[key]}
              </Button>
            </AnimatedPress>
          ))}
        </div>
      </div>

      <ThemePicker />
    </div>
  );
});

interface LanguageSectionProps {
  classes: ClassBag;
  language: SettingsState["language"];
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  t: (k: string) => string;
}

const LanguageSection = memo(function LanguageSection({
  classes,
  language,
  updateSetting,
  t,
}: LanguageSectionProps) {
  const setEn = useCallback(() => updateSetting("language", "en"), [updateSetting]);
  const setHu = useCallback(() => updateSetting("language", "hu"), [updateSetting]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <Label className={`${classes.text} ${classes.shadow}`}>{t("language.title")}</Label>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <AnimatedPress>
          <Button
            className={`cursor-pointer ${classes.btn} ${classes.shadow} ${language === "en" ? classes.ring : ""}`}
            onClick={setEn}
          >
            <img src={gbFlag} alt="GB" className="h-3.5 w-auto" />
            {t("language.en")}
          </Button>
        </AnimatedPress>
        <AnimatedPress>
          <Button
            className={`cursor-pointer ${classes.btn} ${classes.shadow} ${language === "hu" ? classes.ring : ""}`}
            onClick={setHu}
          >
            <img src={huFlag} alt="HU" className="h-3.5 w-auto" />
            {t("language.hu")}
          </Button>
        </AnimatedPress>
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
    const rawBg = getBackgroundClasses(settings.useLiquidGlass, settings.useDarkMode);
    const bg = animReady ? rawBg : rawBg.replace(/backdrop-blur-\S+/g, "");
    const btn = getButtonClasses(settings.useLiquidGlass, settings.useDarkMode);
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
    <Card className={`z-0 flex w-full max-w-6xl flex-col gap-8 p-6 sm:p-8 lg:p-10 ${classes.bg}`}>
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        {/* Visual — first in, no delay */}
        <div
          className="flex flex-1 flex-col items-center justify-center gap-6"
          style={sectionStyle(animReady, 0)}
        >
          <Label className={`${classes.text} ${classes.shadow}`}>{t("visual.title")}</Label>
          <div className="flex w-full justify-center">
            <SettingToggle />
          </div>
        </div>

        {/* Themes + Animation inline — 80 ms */}
        <div
          style={sectionStyle(animReady, 80)}
          className="flex flex-1 flex-col items-center justify-center gap-6"
        >
          <ThemeSection
            classes={classes}
            context={context}
            t={t}
            currentOverride={settings.animationOverride}
            setAnimOverride={setAnimOverride}
          />
        </div>

        {/* Language — 160 ms */}
        <div
          style={sectionStyle(animReady, 160)}
          className="flex flex-1 flex-col items-center justify-center gap-6"
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
