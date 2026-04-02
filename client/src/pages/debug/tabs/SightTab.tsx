import { useEffect, useMemo, useRef, useState } from "react";
import {
  Zap,
  Eye,
  Layers,
  Palette,
  BellRing,
  RefreshCw,
  Accessibility,
  Gauge,
  Copy,
  Network,
} from "lucide-react";
import { StyledSelect } from "@/components/ui/styled-select";
import { Switch } from "@/components/ui/switch";
import { useDebugSettings } from "@/hooks/useDebugSettings";
import { toast } from "@/lib/toast";
import { Section, InfoRow } from "./shared";
import { useTranslation } from "react-i18next";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

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

const VIEWPORT_PRESETS = [
  { id: "desktop-1280", label: "Desktop 1280×720", width: 1280, height: 720 },
  { id: "desktop-1920", label: "Desktop 1920×1080", width: 1920, height: 1080 },
  { id: "tablet-768", label: "Tablet 768×1024", width: 768, height: 1024 },
  { id: "mobile-390", label: "Mobile 390×844", width: 390, height: 844 },
  { id: "mobile-360", label: "Mobile 360×640", width: 360, height: 640 },
  { id: "custom", label: "Custom", width: 0, height: 0 },
] as const;

export function SightTab({
  textColor,
  subtextColor,
  panelBg,
  inputClass,
  bgClass,
  mode = "visual",
}: {
  textColor: string;
  subtextColor: string;
  panelBg: string;
  inputClass: string;
  bgClass: string;
  mode?: "visual" | "emulation" | "diagnostics";
}) {
  const { settings, update } = useDebugSettings();
  const { t } = useTranslation("debug");
  const [cssVars, setCssVars] = useState<Record<string, string>>({});
  const [delayText, setDelayText] = useState(String(settings.networkDelayMs));
  const [jitterText, setJitterText] = useState(
    String(settings.networkJitterMs),
  );
  const [viewportWidthText, setViewportWidthText] = useState(
    String(settings.forceViewportWidth),
  );
  const [viewportHeightText, setViewportHeightText] = useState(
    String(settings.forceViewportHeight),
  );
  const renderCount = useRef(0);
  renderCount.current += 1;
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const resolved: Record<string, string> = {};
    for (const v of CSS_VARS) {
      resolved[v] = style.getPropertyValue(v).trim() || "—";
    }
    setCssVars(resolved);
  }, []);

  useEffect(() => {
    setDelayText(String(settings.networkDelayMs));
    setJitterText(String(settings.networkJitterMs));
  }, [settings.networkDelayMs, settings.networkJitterMs]);

  useEffect(() => {
    setViewportWidthText(String(settings.forceViewportWidth));
    setViewportHeightText(String(settings.forceViewportHeight));
  }, [settings.forceViewportWidth, settings.forceViewportHeight]);

  const parsedVars = useMemo(() => {
    const parseCssColor = (value: string): [number, number, number] | null => {
      const hex = value.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
      if (hex) {
        const raw = hex[1];
        const full =
          raw.length === 3
            ? raw
                .split("")
                .map((c) => `${c}${c}`)
                .join("")
            : raw;
        return [
          parseInt(full.slice(0, 2), 16),
          parseInt(full.slice(2, 4), 16),
          parseInt(full.slice(4, 6), 16),
        ];
      }

      const rgb = value.match(/rgba?\(([^)]+)\)/i);
      if (rgb) {
        const [r, g, b] = rgb[1].split(",").map((s) => Number(s.trim()));
        if ([r, g, b].every((n) => Number.isFinite(n))) return [r, g, b];
      }

      return null;
    };

    const toLuminance = ([r, g, b]: [number, number, number]): number => {
      const [R, G, B] = [r, g, b].map((c) => {
        const x = c / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    };

    const contrast = (
      a: [number, number, number],
      b: [number, number, number],
    ) => {
      const L1 = toLuminance(a);
      const L2 = toLuminance(b);
      const [maxL, minL] = L1 > L2 ? [L1, L2] : [L2, L1];
      return (maxL + 0.05) / (minL + 0.05);
    };

    return Object.fromEntries(
      CSS_VARS.map((key) => {
        const rgb = parseCssColor(cssVars[key] ?? "");
        if (!rgb) return [key, { ratioOnWhite: null, ratioOnBlack: null }];
        return [
          key,
          {
            ratioOnWhite: contrast(rgb, [255, 255, 255]),
            ratioOnBlack: contrast(rgb, [0, 0, 0]),
          },
        ];
      }),
    ) as Record<
      string,
      { ratioOnWhite: number | null; ratioOnBlack: number | null }
    >;
  }, [cssVars]);

  const pillBase = `text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer`;
  const pillActive = `bg-white/20 ${textColor}`;
  const pillInactive = `${subtextColor} hover:bg-white/10`;

  const row = (label: string, value: boolean, key: keyof typeof settings) => (
    <div className="flex items-center justify-between py-1.5 border-b border-current/5 last:border-0">
      <span className={`text-xs ${subtextColor}`}>{label}</span>
      <Switch checked={value} onCheckedChange={(v) => update({ [key]: v })} />
    </div>
  );

  const saveNetwork = () => {
    const delay = Number(delayText);
    const jitter = Number(jitterText);
    update({
      networkDelayMs: Number.isFinite(delay)
        ? Math.max(0, Math.round(delay))
        : 0,
      networkJitterMs: Number.isFinite(jitter)
        ? Math.max(0, Math.round(jitter))
        : 0,
    });
    toast.success("Network simulation updated");
  };

  const applyViewportCustomSize = () => {
    const width = Number(viewportWidthText);
    const height = Number(viewportHeightText);
    update({
      forceViewportPreset: "custom",
      forceViewportWidth: Number.isFinite(width)
        ? Math.max(320, Math.round(width))
        : 1280,
      forceViewportHeight: Number.isFinite(height)
        ? Math.max(320, Math.round(height))
        : 720,
    });
    toast.success("Custom viewport applied");
  };

  const applyViewportPreset = (presetId: string) => {
    const preset = VIEWPORT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    if (preset.id === "custom") {
      update({ forceViewportPreset: "custom" });
      return;
    }
    update({
      forceViewportPreset: preset.id,
      forceViewportWidth: preset.width,
      forceViewportHeight: preset.height,
    });
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied token value");
    } catch {
      toast.error("Failed to copy token value");
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-min">
      {/* ── Visual mode ───────────────────────────────────────────────────── */}
      {mode === "visual" && (
        <>
          {/* Animation */}
          <Section
            title={t("sight.animation.title")}
            icon={<Zap size={11} />}
            panelBg={panelBg}
            subtextColor={subtextColor}
          >
            <div className="flex flex-col gap-2 py-1">
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

              <div className="flex items-center justify-between pt-1 border-t border-current/5">
                <span className={`text-xs ${subtextColor}`}>
                  {t("sight.animation.forceReplay")}
                </span>
                <button
                  onClick={() => window.location.reload()}
                  className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${subtextColor} hover:bg-white/10 transition-colors`}
                >
                  <RefreshCw size={10} /> {t("sight.animation.reload")}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-current/5">
                <span className={`text-xs ${subtextColor}`}>
                  {t("sight.animation.navbar")}
                </span>
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

          {/* Visual */}
          <Section
            title={t("sight.visual.title")}
            icon={<Eye size={11} />}
            panelBg={panelBg}
            subtextColor={subtextColor}
          >
            {row(
              t("sight.visual.disableBlur"),
              settings.noBackdropBlur,
              "noBackdropBlur",
            )}
            {row(
              t("sight.visual.layoutBorders"),
              settings.layoutBorders,
              "layoutBorders",
            )}
            {row(
              t("sight.visual.elementInspector"),
              settings.elementInspector,
              "elementInspector",
            )}
            <p className={`text-[10px] leading-tight pt-1 ${subtextColor}`}>
              Element inspector: hover any element to inspect its tag, classes,
              and computed CSS properties.
            </p>
          </Section>

          {/* Overlays */}
          <Section
            title={t("sight.overlays.title")}
            icon={<Layers size={11} />}
            panelBg={panelBg}
            subtextColor={subtextColor}
          >
            {row(t("sight.overlays.fps"), settings.showFps, "showFps")}
            {row(
              t("sight.overlays.scroll"),
              settings.showScrollPos,
              "showScrollPos",
            )}
            {row(
              "Breakpoint badge",
              settings.showBreakpointBadge,
              "showBreakpointBadge",
            )}
            <p className={`text-[10px] leading-tight pt-1 ${subtextColor}`}>
              Breakpoint badge shows the active Tailwind screen size and window
              width in the bottom-right corner.
            </p>
          </Section>

          {/* Toast Test */}
          <Section
            title={t("sight.toast.title")}
            icon={<BellRing size={11} />}
            panelBg={panelBg}
            subtextColor={subtextColor}
          >
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

          {/* CSS Variables */}
          <Section
            title={t("sight.cssVars.title")}
            icon={<Palette size={11} />}
            panelBg={panelBg}
            subtextColor={subtextColor}
          >
            {CSS_VARS.map((v) => (
              <div
                key={v}
                className="flex items-center gap-2 py-1.5 border-b border-current/5 last:border-0"
              >
                <span
                  className="size-3 rounded-full border border-white/30 shrink-0"
                  style={{ backgroundColor: cssVars[v] ?? "transparent" }}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] ${subtextColor}`}>{v}</p>
                  <p
                    className={`text-[10px] font-mono truncate ${textColor}`}
                  >
                    {cssVars[v] ?? "…"}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(cssVars[v] ?? "")}
                  className="text-[10px] px-2 py-1 rounded border border-current/20 hover:border-current/40"
                  title="Copy variable value"
                >
                  <Copy size={11} />
                </button>
              </div>
            ))}
          </Section>
        </>
      )}

      {/* ── Emulation mode ────────────────────────────────────────────────── */}
      {mode === "emulation" && (
        <>
          {/* Viewport Emulation */}
          <Section
            title="Viewport Emulation"
            icon={<Eye size={11} />}
            panelBg={panelBg}
            subtextColor={subtextColor}
          >
            {row(
              "Force reduced motion",
              settings.forceReducedMotion,
              "forceReducedMotion",
            )}
            {row("Compact density", settings.compactDensity, "compactDensity")}
            <p className={`text-[10px] leading-tight -mt-0.5 mb-1 ${subtextColor}`}>
              Reduces font size and spacing for a denser information display.
            </p>
            {row(
              "Safe-area outlines",
              settings.safeAreaOutlines,
              "safeAreaOutlines",
            )}
            <p className={`text-[10px] leading-tight -mt-0.5 ${subtextColor}`}>
              Draws colored borders representing device safe-area insets (notch,
              home bar).
            </p>

            <div className="pt-2 mt-1 border-t border-current/5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className={`text-xs ${subtextColor}`}>
                  Force JS viewport
                </span>
                <Switch
                  checked={settings.forceViewportEnabled}
                  onCheckedChange={(v) => update({ forceViewportEnabled: v })}
                />
              </div>

              <p className={`text-[10px] leading-tight ${subtextColor}`}>
                Overrides <code>window.innerWidth/Height</code> and{" "}
                <code>matchMedia</code> so JS-driven responsive logic (e.g.
                Navbar breakpoints) reacts to the emulated size. Tailwind CSS
                classes are compile-time and are not affected.
              </p>

              <div className="flex flex-col gap-1">
                <span className={`text-[10px] ${subtextColor}`}>Preset</span>
                <StyledSelect
                  value={settings.forceViewportPreset}
                  options={VIEWPORT_PRESETS.map((p) => p.id)}
                  onChange={applyViewportPreset}
                  inputClass={inputClass}
                  textColor={textColor}
                  bgClass={bgClass}
                  renderOption={(id) =>
                    VIEWPORT_PRESETS.find((p) => p.id === id)?.label ?? id
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <span className={`text-[10px] ${subtextColor}`}>Width</span>
                  <input
                    type="number"
                    min={320}
                    max={4096}
                    value={viewportWidthText}
                    onChange={(e) => setViewportWidthText(e.target.value)}
                    className={`text-xs px-2 py-1.5 rounded-lg ${inputClass}`}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`text-[10px] ${subtextColor}`}>Height</span>
                  <input
                    type="number"
                    min={320}
                    max={4096}
                    value={viewportHeightText}
                    onChange={(e) => setViewportHeightText(e.target.value)}
                    className={`text-xs px-2 py-1.5 rounded-lg ${inputClass}`}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={applyViewportCustomSize}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-colors"
                >
                  Apply custom
                </button>
              </div>
            </div>
          </Section>

          {/* Network Simulation */}
          <Section
            title="Network Simulation"
            icon={<Network size={11} />}
            panelBg={panelBg}
            subtextColor={subtextColor}
          >
            <p className={`text-[10px] leading-tight mb-2 ${subtextColor}`}>
              Adds artificial latency to all Axios API requests to simulate slow
              connections.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className={`text-[10px] ${subtextColor}`}>
                  Base delay (ms)
                </span>
                <input
                  type="number"
                  min={0}
                  max={10000}
                  value={delayText}
                  onChange={(e) => setDelayText(e.target.value)}
                  className={`text-xs px-2 py-1.5 rounded-lg ${inputClass}`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className={`text-[10px] ${subtextColor}`}>
                  Jitter ± (ms)
                </span>
                <input
                  type="number"
                  min={0}
                  max={3000}
                  value={jitterText}
                  onChange={(e) => setJitterText(e.target.value)}
                  className={`text-xs px-2 py-1.5 rounded-lg ${inputClass}`}
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-current/5">
              <span className={`text-[10px] ${subtextColor}`}>
                Jitter adds random variance (±) to each request delay.
              </span>
              <button
                onClick={saveNetwork}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
              >
                Apply
              </button>
            </div>
          </Section>
        </>
      )}

      {/* ── Diagnostics mode ──────────────────────────────────────────────── */}
      {mode === "diagnostics" && (
        <>
          {/* A11y */}
          <Section
            title="A11y"
            icon={<Accessibility size={11} />}
            panelBg={panelBg}
            subtextColor={subtextColor}
          >
            {CSS_VARS.map((v) => {
              const score = parsedVars[v];
              return (
                <div
                  key={`a11y-${v}`}
                  className="py-1 border-b border-current/5 last:border-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] ${subtextColor}`}>{v}</span>
                    <span
                      className={`text-[10px] font-mono ${subtextColor}`}
                    >
                      W{" "}
                      {score.ratioOnWhite
                        ? score.ratioOnWhite.toFixed(2)
                        : "—"}{" "}
                      · B{" "}
                      {score.ratioOnBlack
                        ? score.ratioOnBlack.toFixed(2)
                        : "—"}
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="pt-2 border-t border-current/5 flex items-center justify-between gap-2">
              <button className="text-xs px-3 py-1.5 rounded-md border border-current/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                Focus ring preview
              </button>
              <input
                placeholder="Tab into me"
                className="h-8 px-2 rounded-md text-xs bg-black/10 border border-current/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              />
            </div>
          </Section>

          {/* Render Diagnostics */}
          <Section
            title="Render Diagnostics"
            icon={<Gauge size={11} />}
            panelBg={panelBg}
            subtextColor={subtextColor}
          >
            <InfoRow
              label="Inspector renders"
              value={renderCount.current}
              textColor={textColor}
              subtextColor={subtextColor}
              mono
            />
            <InfoRow
              label="React Query fetching"
              value={isFetching}
              textColor={textColor}
              subtextColor={subtextColor}
              mono
            />
            <InfoRow
              label="React Query mutating"
              value={isMutating}
              textColor={textColor}
              subtextColor={subtextColor}
              mono
            />
            {row(
              "Click target checker",
              settings.clickTargetChecker,
              "clickTargetChecker",
            )}
            {row(
              "Z-index inspector",
              settings.zIndexInspector,
              "zIndexInspector",
            )}
            <p className={`text-[10px] leading-tight pt-1 ${subtextColor}`}>
              Click target: flags elements smaller than 44×44 px (WCAG touch
              target). Z-index: shows the stacking order of elements under the
              cursor. Both require Element inspector to be on.
            </p>
          </Section>
        </>
      )}
    </div>
  );
}
