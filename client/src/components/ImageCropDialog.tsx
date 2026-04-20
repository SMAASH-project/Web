/**
 * ImageCropDialog
 *
 * Canvas-based image cropper with zoom, pan, and independent H/V stretch.
 * Rendered as a Radix Dialog portal so it always sits at the top of the
 * Radix dialog stack, properly owning the focus trap and Escape key.
 *
 * Props:
 *   open        – controls visibility
 *   file        – the raw File selected by the user (null = not yet chosen)
 *   aspectRatio – target aspect ratio (width / height); e.g. 16/9 or 1
 *   circular    – when true a circular mask overlay is shown (profile pictures)
 *   onApply     – called with the cropped File when the user confirms
 *   onCancel    – called when the user dismisses without applying
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Loader2, ZoomIn, ZoomOut, X, ArrowLeftRight, ArrowUpDown } from "lucide-react";
import { useSettings } from "@/pages/settings/SettingsContext";
import {
  getButtonClasses,
  getDialogClasses,
  getTextShadow,
  getTextColor,
  getSubtextColor,
} from "@/lib/utils";

const MARGIN_X = 32;
const MARGIN_Y = 24;

interface ImageCropDialogProps {
  open: boolean;
  file: File | null;
  aspectRatio: number;
  circular?: boolean;
  onApply: (croppedFile: File) => void;
  onCancel: () => void;
}

export function ImageCropDialog({
  open,
  file,
  aspectRatio,
  circular = false,
  onApply,
  onCancel,
}: ImageCropDialogProps) {
  const { settings } = useSettings();

  const [CROP_W] = useState(() =>
    Math.min(Math.max(window.innerWidth - 80 - MARGIN_X * 2, 220), 480),
  );
  const CROP_H = Math.round(CROP_W / aspectRatio);
  const CONTAINER_W = CROP_W + MARGIN_X * 2;
  const CONTAINER_H = CROP_H + MARGIN_Y * 2;

  // ── image state ────────────────────────────────────────────────────────────
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [natSize, setNatSize] = useState<{ w: number; h: number } | null>(null);
  const [baseScale, setBaseScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isApplying, setIsApplying] = useState(false);

  // ── refs (kept in sync so non-React handlers read latest values) ───────────
  const imgRef = useRef<HTMLImageElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPtr = useRef({ x: 0, y: 0 });
  const natSizeRef = useRef(natSize);
  const baseScaleRef = useRef(baseScale);
  const zoomRef = useRef(zoom);
  const scaleXRef = useRef(scaleX);
  const scaleYRef = useRef(scaleY);
  natSizeRef.current = natSize;
  baseScaleRef.current = baseScale;
  zoomRef.current = zoom;
  scaleXRef.current = scaleX;
  scaleYRef.current = scaleY;

  // ── helpers ────────────────────────────────────────────────────────────────

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const constrainPan = useCallback(
    (
      px: number,
      py: number,
      z: number,
      ns: { w: number; h: number },
      bs: number,
      sx: number,
      sy: number,
    ) => {
      const rw = ns.w * bs * z * sx;
      const rh = ns.h * bs * z * sy;
      return {
        x: clamp(px, CROP_W - rw, 0),
        y: clamp(py, CROP_H - rh, 0),
      };
    },
    [CROP_W, CROP_H],
  );

  // ── image lifecycle ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!file) {
      setImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!open) {
      setNatSize(null);
      setBaseScale(1);
      setZoom(1);
      setScaleX(1);
      setScaleY(1);
      setPan({ x: 0, y: 0 });
    }
  }, [open]);

  const handleImageLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    const bs = Math.max(CROP_W / img.naturalWidth, CROP_H / img.naturalHeight);
    const ns = { w: img.naturalWidth, h: img.naturalHeight };
    const rw = ns.w * bs;
    const rh = ns.h * bs;
    setNatSize(ns);
    setBaseScale(bs);
    setZoom(1);
    setScaleX(1);
    setScaleY(1);
    setPan({ x: (CROP_W - rw) / 2, y: (CROP_H - rh) / 2 });
  };

  // ── drag interaction ───────────────────────────────────────────────────────

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    lastPtr.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !natSize) return;
    const dx = e.clientX - lastPtr.current.x;
    const dy = e.clientY - lastPtr.current.y;
    lastPtr.current = { x: e.clientX, y: e.clientY };
    setPan((p) => constrainPan(p.x + dx, p.y + dy, zoom, natSize, baseScale, scaleX, scaleY));
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  // ── zoom ───────────────────────────────────────────────────────────────────

  const applyZoom = useCallback(
    (newZoom: number) => {
      const z = clamp(newZoom, 1, 3);
      const oldZ = zoomRef.current;
      setZoom(z);
      const ns = natSizeRef.current;
      const bs = baseScaleRef.current;
      const sx = scaleXRef.current;
      const sy = scaleYRef.current;
      if (ns) {
        const ratio = z / oldZ;
        setPan((p) => {
          const cx = p.x * ratio + (CROP_W / 2) * (1 - ratio);
          const cy = p.y * ratio + (CROP_H / 2) * (1 - ratio);
          return constrainPan(cx, cy, z, ns, bs, sx, sy);
        });
      }
    },
    [constrainPan, CROP_W, CROP_H],
  );

  const applyScaleX = useCallback(
    (newSx: number) => {
      const sx = clamp(newSx, 1, 4);
      const oldSx = scaleXRef.current;
      setScaleX(sx);
      const ns = natSizeRef.current;
      const bs = baseScaleRef.current;
      const z = zoomRef.current;
      const sy = scaleYRef.current;
      if (ns) {
        const ratio = sx / oldSx;
        setPan((p) => {
          const cx = p.x * ratio + (CROP_W / 2) * (1 - ratio);
          return constrainPan(cx, p.y, z, ns, bs, sx, sy);
        });
      }
    },
    [constrainPan, CROP_W],
  );

  const applyScaleY = useCallback(
    (newSy: number) => {
      const sy = clamp(newSy, 1, 4);
      const oldSy = scaleYRef.current;
      setScaleY(sy);
      const ns = natSizeRef.current;
      const bs = baseScaleRef.current;
      const z = zoomRef.current;
      const sx = scaleXRef.current;
      if (ns) {
        const ratio = sy / oldSy;
        setPan((p) => {
          const cy = p.y * ratio + (CROP_H / 2) * (1 - ratio);
          return constrainPan(p.x, cy, z, ns, bs, sx, sy);
        });
      }
    },
    [constrainPan, CROP_H],
  );

  // Non-passive wheel listener
  useEffect(() => {
    if (!open) return;
    const el = cropContainerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      const oldZoom = zoomRef.current;
      const newZoom = clamp(oldZoom + delta, 1, 3);
      setZoom(newZoom);
      const ns = natSizeRef.current;
      const bs = baseScaleRef.current;
      const sx = scaleXRef.current;
      const sy = scaleYRef.current;
      if (ns) {
        const ratio = newZoom / oldZoom;
        setPan((p) => {
          const cx = p.x * ratio + (CROP_W / 2) * (1 - ratio);
          const cy = p.y * ratio + (CROP_H / 2) * (1 - ratio);
          return constrainPan(cx, cy, newZoom, ns, bs, sx, sy);
        });
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [open, CROP_W, CROP_H, constrainPan]);

  // ── canvas export (destination-rect approach to preserve stretch) ──────────

  const handleApply = async () => {
    if (!natSize || !imgRef.current || !file) return;
    setIsApplying(true);
    try {
      const renderW = natSize.w * baseScale * zoom * scaleX;
      const renderH = natSize.h * baseScale * zoom * scaleY;

      const outW = circular ? 400 : 960;
      const outH = circular ? 400 : Math.round(960 / aspectRatio);
      const scale = outW / CROP_W;

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, outW, outH);
      ctx.drawImage(
        imgRef.current,
        0, 0, natSize.w, natSize.h,
        pan.x * scale, pan.y * scale,
        renderW * scale, renderH * scale,
      );

      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.92));
      if (!blob) return;

      const basename = file.name.replace(/\.[^.]+$/, "");
      onApply(new File([blob], `${basename}_cropped.jpg`, { type: "image/jpeg" }));
    } finally {
      setIsApplying(false);
    }
  };

  // ── styling ────────────────────────────────────────────────────────────────

  const dialogClass = getDialogClasses(settings.useLiquidGlass, settings.useDarkMode);
  const buttonClass = getButtonClasses(settings.useLiquidGlass, settings.useDarkMode);
  const textShadow = getTextShadow(settings.useLiquidGlass, settings.useDarkMode);
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const subtextColor = getSubtextColor(settings.useLiquidGlass, settings.useDarkMode);

  const renderW = natSize ? natSize.w * baseScale * zoom * scaleX : 0;
  const renderH = natSize ? natSize.h * baseScale * zoom * scaleY : 0;

  const circleR = Math.min(CROP_W, CROP_H) / 2;
  const circleCX = MARGIN_X + CROP_W / 2;
  const circleCY = MARGIN_Y + CROP_H / 2;

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) onCancel();
      }}
    >
      <DialogPrimitive.Portal forceMount>
        <AnimatePresence>
          {open && (
            <>
              <DialogPrimitive.Overlay asChild>
                <motion.div
                  key="icd-overlay"
                  className="fixed inset-0 z-9999 bg-black/65 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                />
              </DialogPrimitive.Overlay>

              <DialogPrimitive.Content
                asChild
                aria-label="Crop image"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
              >
                <motion.div
                  key="icd-content"
                  className="fixed inset-0 z-10000 flex items-center justify-center p-4 select-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <motion.div
                    className={`relative flex w-full flex-col gap-5 rounded-2xl p-6 ${dialogClass} ${textShadow}`}
                    style={{ maxWidth: CONTAINER_W + 48 }}
                    initial={{ scale: 0.96, y: 8 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.96, y: 8 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h2 className={`text-base font-semibold ${textColor}`}>Crop Image</h2>
                      <button
                        type="button"
                        onClick={onCancel}
                        className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-100 ${subtextColor} opacity-60`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Crop area */}
                    <div className="flex flex-col items-center gap-4">
                      <div
                        ref={cropContainerRef}
                        className="relative cursor-grab touch-none overflow-hidden rounded-lg active:cursor-grabbing"
                        style={{ width: CONTAINER_W, height: CONTAINER_H }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                      >
                        <div className="absolute inset-0 bg-black/30" />

                        {imageUrl && (
                          <img
                            ref={imgRef}
                            src={imageUrl}
                            onLoad={handleImageLoad}
                            draggable={false}
                            className="pointer-events-none absolute select-none"
                            style={{
                              left: MARGIN_X + pan.x,
                              top: MARGIN_Y + pan.y,
                              width: renderW || undefined,
                              height: renderH || undefined,
                              display: natSize ? "block" : "none",
                            }}
                            alt="crop"
                          />
                        )}

                        {imageUrl && !natSize && (
                          <div className="flex h-full w-full items-center justify-center bg-black/40">
                            <Loader2 className="h-6 w-6 animate-spin text-white/60" />
                          </div>
                        )}

                        {natSize && (
                          <svg
                            className="pointer-events-none absolute inset-0"
                            width={CONTAINER_W}
                            height={CONTAINER_H}
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <defs>
                              <mask id="icd-dim-mask">
                                <rect width={CONTAINER_W} height={CONTAINER_H} fill="white" />
                                {circular ? (
                                  <circle cx={circleCX} cy={circleCY} r={circleR} fill="black" />
                                ) : (
                                  <rect
                                    x={MARGIN_X}
                                    y={MARGIN_Y}
                                    width={CROP_W}
                                    height={CROP_H}
                                    fill="black"
                                  />
                                )}
                              </mask>
                            </defs>

                            <rect
                              width={CONTAINER_W}
                              height={CONTAINER_H}
                              fill="black"
                              fillOpacity={0.55}
                              mask="url(#icd-dim-mask)"
                            />

                            {!circular && (
                              <>
                                <line
                                  x1={MARGIN_X + CROP_W / 3}
                                  y1={MARGIN_Y}
                                  x2={MARGIN_X + CROP_W / 3}
                                  y2={MARGIN_Y + CROP_H}
                                  stroke="white"
                                  strokeOpacity={0.25}
                                  strokeWidth={1}
                                />
                                <line
                                  x1={MARGIN_X + (CROP_W * 2) / 3}
                                  y1={MARGIN_Y}
                                  x2={MARGIN_X + (CROP_W * 2) / 3}
                                  y2={MARGIN_Y + CROP_H}
                                  stroke="white"
                                  strokeOpacity={0.25}
                                  strokeWidth={1}
                                />
                                <line
                                  x1={MARGIN_X}
                                  y1={MARGIN_Y + CROP_H / 3}
                                  x2={MARGIN_X + CROP_W}
                                  y2={MARGIN_Y + CROP_H / 3}
                                  stroke="white"
                                  strokeOpacity={0.25}
                                  strokeWidth={1}
                                />
                                <line
                                  x1={MARGIN_X}
                                  y1={MARGIN_Y + (CROP_H * 2) / 3}
                                  x2={MARGIN_X + CROP_W}
                                  y2={MARGIN_Y + (CROP_H * 2) / 3}
                                  stroke="white"
                                  strokeOpacity={0.25}
                                  strokeWidth={1}
                                />
                              </>
                            )}

                            {circular ? (
                              <circle
                                cx={circleCX}
                                cy={circleCY}
                                r={circleR}
                                fill="none"
                                stroke="white"
                                strokeWidth={1.5}
                                strokeOpacity={0.55}
                              />
                            ) : (
                              <rect
                                x={MARGIN_X}
                                y={MARGIN_Y}
                                width={CROP_W}
                                height={CROP_H}
                                fill="none"
                                stroke="white"
                                strokeWidth={1}
                                strokeOpacity={0.45}
                                rx={4}
                              />
                            )}
                          </svg>
                        )}
                      </div>

                      {/* Controls */}
                      <div
                        className="flex w-full flex-col gap-2.5"
                        style={{ maxWidth: CONTAINER_W }}
                      >
                        {/* Zoom */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => applyZoom(zoom - 0.15)}
                            className={`shrink-0 transition-opacity ${subtextColor} hover:opacity-100 disabled:opacity-30`}
                            disabled={zoom <= 1}
                          >
                            <ZoomOut className="h-4 w-4" />
                          </button>
                          <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.01}
                            value={zoom}
                            onChange={(e) => applyZoom(parseFloat(e.target.value))}
                            disabled={!natSize}
                            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-white disabled:cursor-not-allowed disabled:opacity-40"
                          />
                          <button
                            type="button"
                            onClick={() => applyZoom(zoom + 0.15)}
                            className={`shrink-0 transition-opacity ${subtextColor} hover:opacity-100 disabled:opacity-30`}
                            disabled={zoom >= 3}
                          >
                            <ZoomIn className="h-4 w-4" />
                          </button>
                        </div>

                        {/* H-Stretch */}
                        <div className="flex items-center gap-3">
                          <ArrowLeftRight
                            className={`h-4 w-4 shrink-0 ${subtextColor} opacity-70`}
                          />
                          <input
                            type="range"
                            min={1}
                            max={4}
                            step={0.01}
                            value={scaleX}
                            onChange={(e) => applyScaleX(parseFloat(e.target.value))}
                            disabled={!natSize}
                            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-white disabled:cursor-not-allowed disabled:opacity-40"
                          />
                          <span className={`w-8 shrink-0 text-right text-xs ${subtextColor} opacity-70`}>
                            {scaleX.toFixed(2)}×
                          </span>
                        </div>

                        {/* V-Stretch */}
                        <div className="flex items-center gap-3">
                          <ArrowUpDown
                            className={`h-4 w-4 shrink-0 ${subtextColor} opacity-70`}
                          />
                          <input
                            type="range"
                            min={1}
                            max={4}
                            step={0.01}
                            value={scaleY}
                            onChange={(e) => applyScaleY(parseFloat(e.target.value))}
                            disabled={!natSize}
                            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-white disabled:cursor-not-allowed disabled:opacity-40"
                          />
                          <span className={`w-8 shrink-0 text-right text-xs ${subtextColor} opacity-70`}>
                            {scaleY.toFixed(2)}×
                          </span>
                        </div>
                      </div>

                      <p className={`text-xs ${subtextColor}`}>
                        Drag to reposition · Scroll or slider to zoom
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={onCancel}
                        className={`cursor-pointer ${buttonClass} ${textShadow}`}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleApply}
                        disabled={!natSize || isApplying}
                        className={`cursor-pointer ${buttonClass} ${textShadow}`}
                      >
                        {isApplying ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Applying…
                          </>
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              </DialogPrimitive.Content>
            </>
          )}
        </AnimatePresence>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
