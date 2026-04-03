import { useContext, useEffect } from "react";
import { useDebugSettings } from "@/hooks/useDebugSettings";
import { ColorContext } from "@/pages/settings/ColorContext";
import { getAverageHexColor } from "@/lib/utils";
import {
  SPEED_TO_CSS,
  applyViewportOverride,
  clearViewportOverride,
  hexLuminance,
} from "./debugShared";

export function DebugEffects() {
  const { settings } = useDebugSettings();
  const colorCtx = useContext(ColorContext);
  const colorLeft = colorCtx?.colorLeft ?? "#616161";
  const colorMiddle = colorCtx?.colorMiddle ?? "#000000";
  const colorRight = colorCtx?.colorRight ?? "#616161";

  useEffect(() => {
    document.body.classList.toggle("debug-reduced-motion", settings.forceReducedMotion);
  }, [settings.forceReducedMotion]);

  useEffect(() => {
    document.body.classList.toggle("debug-compact", settings.compactDensity);
  }, [settings.compactDensity]);

  useEffect(() => {
    document.body.classList.toggle("debug-safe-area", settings.safeAreaOutlines);
  }, [settings.safeAreaOutlines]);

  useEffect(() => {
    if (!settings.forceViewportEnabled) {
      clearViewportOverride();
      return;
    }

    const w = Math.max(320, Math.round(settings.forceViewportWidth || 1280));
    const h = Math.max(320, Math.round(settings.forceViewportHeight || 720));
    applyViewportOverride(w, h);

    return () => {
      if (!settings.forceViewportEnabled) {
        clearViewportOverride();
      }
    };
  }, [settings.forceViewportEnabled, settings.forceViewportWidth, settings.forceViewportHeight]);

  useEffect(() => {
    return () => {
      clearViewportOverride();
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("debug-no-blur", settings.noBackdropBlur);
  }, [settings.noBackdropBlur]);

  useEffect(() => {
    document.body.classList.toggle("debug-layout", settings.layoutBorders);
    if (!settings.layoutBorders) return;
    const avg = getAverageHexColor([colorLeft, colorMiddle, colorRight]);
    const lum = hexLuminance(avg);
    // High luminance (light background) → dark indigo outline; dark background → bright cyan
    const color =
      lum > 0.45
        ? "rgba(67, 56, 202, 0.80)" // indigo-700 — contrasts on light
        : "rgba(34, 211, 238, 0.75)"; // cyan-400   — contrasts on dark
    document.documentElement.style.setProperty("--debug-layout-color", color);
  }, [settings.layoutBorders, colorLeft, colorMiddle, colorRight]);

  useEffect(() => {
    const tag = document.getElementById("debug-speed");
    const duration = SPEED_TO_CSS[settings.animationSpeed];
    if (!duration) {
      tag?.remove();
      return;
    }
    const style = tag ?? document.createElement("style");
    style.id = "debug-speed";
    style.textContent = `* { transition-duration: ${duration}s !important; }`;
    if (!tag) document.head.appendChild(style);
  }, [settings.animationSpeed]);

  return null;
}
