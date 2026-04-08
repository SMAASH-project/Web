import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as motion from "motion/react-client";
import { useSettings } from "@/pages/settings/SettingsContext";
import {
  getTextColor,
  getSubtextColor,
  getTextShadow,
  getBackgroundClasses,
  getButtonClasses,
  sectionStyle,
} from "@/lib/utils";
import { CardAnimation } from "@/animations/CardAnimation";
import { Home } from "lucide-react";

export function NotFoundPage() {
  const { t } = useTranslation("common");
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode, useAnimations } = settings;
  const navigate = useNavigate();

  const [animDone, setAnimDone] = useState(false);
  const handleAnimationComplete = useCallback(() => setAnimDone(true), []);

  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const subtextColor = getSubtextColor(useLiquidGlass, useDarkMode);
  const textShadow = getTextShadow(useLiquidGlass, useDarkMode);
  const panelBg = getBackgroundClasses(useLiquidGlass, useDarkMode, "light");
  const buttonClass = getButtonClasses(useLiquidGlass, useDarkMode);

  const ready = useAnimations ? animDone : true;

  const inner = (
    <div className="z-0 flex min-h-screen w-full flex-col items-center justify-center gap-6 p-6">
      {/* Floating 404 */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={sectionStyle(ready, 0)}
      >
        <span
          className={`text-[10rem] leading-none font-black tracking-tighter opacity-15 select-none ${textColor}`}
        >
          404
        </span>
      </motion.div>

      {/* Panel */}
      <div
        className={`flex flex-col items-center gap-4 rounded-2xl px-10 py-8 text-center ${panelBg}`}
        style={sectionStyle(ready, 80)}
      >
        <h1 className={`text-2xl font-bold tracking-tight ${textColor} ${textShadow}`}>
          {t("notFound.title")}
        </h1>
        <p className={`max-w-xs text-sm ${subtextColor}`}>{t("notFound.description")}</p>

        <button
          onClick={() => navigate("/app")}
          className={`mt-2 flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-150 ${buttonClass} ${textColor} ${textShadow}`}
        >
          <Home size={15} />
          {t("notFound.back")}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`relative flex min-h-screen w-full flex-col ${textColor}`}>
      {useAnimations ? (
        <CardAnimation className="w-full flex-1" onAnimationComplete={handleAnimationComplete}>
          {inner}
        </CardAnimation>
      ) : (
        inner
      )}
    </div>
  );
}
