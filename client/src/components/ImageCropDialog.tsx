/**
 * ImageCropDialog
 *
 * A canvas-based image cropper rendered as a full-screen portal overlay so it
 * is never clipped by a parent dialog or container. The user can drag the image
 * to reposition it and use the zoom slider (or scroll wheel) to zoom in/out.
 * Clicking "Apply" exports a cropped JPEG via the Canvas API and hands it back
 * via onApply.
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
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Loader2, ZoomIn, ZoomOut, X } from "lucide-react";
import { useSettings } from "@/pages/settings/SettingsContext";
import {
  getButtonClasses,
  getDialogClasses,
  getTextShadow,
  getTextColor,
  getSubtextColor,
} from "@/lib/utils";

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

  // Crop frame dimensions — computed once on mount so they stay stable for the
  // lifetime of the component instance (viewport-responsive, never clipped).
  const [CROP_W] = useState(() => Math.min(Math.max(window.innerWidth - 80, 280), 520));
  const CROP_H = Math.round(CROP_W / aspectRatio);

  // ── image state ────────────────────────────────────────────────────────────
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [natSize, setNatSize] = useState<{ w: number; h: number } | null>(null);
  const [baseScale, setBaseScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isApplying, setIsApplying] = useState(false);

  // ── refs ───────────────────────────────────────────────────────────────────
  const imgRef = useRef<HTMLImageElement>(null);
  const cropFrameRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPtr = useRef({ x: 0, y: 0 });
  // Kept in sync each render so the non-React wheel handler reads latest values
  const natSizeRef = useRef(natSize);
  const baseScaleRef = useRef(baseScale);
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  natSizeRef.current = natSize;
  baseScaleRef.current = baseScale;
  zoomRef.current = zoom;
  panRef.current = pan;

  // ── helpers ────────────────────────────────────────────────────────────────

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const constrainPan = useCallback(
    (px: number, py: number, z: number, ns: { w: number; h: number }, bs: number) => {
      const rw = ns.w * bs * z;
      const rh = ns.h * bs * z;
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
    setPan({ x: (CROP_W - rw) / 2, y: (CROP_H - rh) / 2 });
  };

  // ── drag interaction ───────────────────────────────────────────────────────

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    lastPtr.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !natSize) return;
    const dx = e.clientX - lastPtr.current.x;
    const dy = e.clientY - lastPtr.current.y;
    lastPtr.current = { x: e.clientX, y: e.clientY };
    setPan((p) => constrainPan(p.x + dx, p.y + dy, zoom, natSize, baseScale));
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  // ── zoom ───────────────────────────────────────────────────────────────────

  const applyZoom = useCallback(
    (newZoom: number) => {
      const z = clamp(newZoom, 1, 3);
      setZoom(z);
      const ns = natSizeRef.current;
      const bs = baseScaleRef.current;
      if (ns) setPan((p) => constrainPan(p.x, p.y, z, ns, bs));
    },
    [constrainPan],
  );

  // Non-passive wheel listener so we can call preventDefault()
  useEffect(() => {
    const el = cropFrameRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      const newZoom = clamp(zoomRef.current + delta, 1, 3);
      setZoom(newZoom);
      const ns = natSizeRef.current;
      const bs = baseScaleRef.current;
      if (ns) {
        setPan((p) => {
          const rw = ns.w * bs * newZoom;
          const rh = ns.h * bs * newZoom;
          return {
            x: clamp(p.x, CROP_W - rw, 0),
            y: clamp(p.y, CROP_H - rh, 0),
          };
        });
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [CROP_W, CROP_H]);

  // ── canvas export ──────────────────────────────────────────────────────────

  const handleApply = async () => {
    if (!natSize || !imgRef.current || !file) return;
    setIsApplying(true);
    try {
      const rw = natSize.w * baseScale * zoom;
      const rh = natSize.h * baseScale * zoom;

      const srcX = Math.max(0, (-pan.x / rw) * natSize.w);
      const srcY = Math.max(0, (-pan.y / rh) * natSize.h);
      const srcW = Math.min(natSize.w - srcX, (CROP_W / rw) * natSize.w);
      const srcH = Math.min(natSize.h - srcY, (CROP_H / rh) * natSize.h);

      const outW = circular ? 400 : 960;
      const outH = circular ? 400 : Math.round(960 / aspectRatio);

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(imgRef.current, srcX, srcY, srcW, srcH, 0, 0, outW, outH);

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

  const renderW = natSize ? natSize.w * baseScale * zoom : 0;
  const renderH = natSize ? natSize.h * baseScale * zoom : 0;

  // ── render ─────────────────────────────────────────────────────────────────

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />

          {/* Cropper card */}
          <motion.div
            className={`relative z-10 flex w-full flex-col gap-5 rounded-2xl p-6 ${dialogClass} ${textShadow}`}
            style={{ maxWidth: CROP_W + 48 }}
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
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

            {/* Crop frame */}
            <div className="flex flex-col items-center gap-4">
              <div
                ref={cropFrameRef}
                className="relative cursor-grab touch-none overflow-hidden rounded-lg active:cursor-grabbing"
                style={{ width: CROP_W, height: CROP_H }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                {/* Image */}
                {imageUrl && (
                  <img
                    ref={imgRef}
                    src={imageUrl}
                    onLoad={handleImageLoad}
                    draggable={false}
                    className="pointer-events-none absolute select-none"
                    style={{
                      left: pan.x,
                      top: pan.y,
                      width: renderW || undefined,
                      height: renderH || undefined,
                      display: natSize ? "block" : "none",
                    }}
                    alt="crop"
                  />
                )}

                {/* Loading state */}
                {imageUrl && !natSize && (
                  <div className="flex h-full w-full items-center justify-center bg-black/40">
                    <Loader2 className="h-6 w-6 animate-spin text-white/60" />
                  </div>
                )}

                {/* Rule-of-thirds grid */}
                {natSize && (
                  <div className="pointer-events-none absolute inset-0">
                    <div
                      className="absolute top-0 bottom-0 w-px bg-white/25"
                      style={{ left: "33.333%" }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-px bg-white/25"
                      style={{ left: "66.667%" }}
                    />
                    <div
                      className="absolute right-0 left-0 h-px bg-white/25"
                      style={{ top: "33.333%" }}
                    />
                    <div
                      className="absolute right-0 left-0 h-px bg-white/25"
                      style={{ top: "66.667%" }}
                    />
                  </div>
                )}

                {/* Circular mask overlay */}
                {circular && natSize && (
                  <svg
                    className="pointer-events-none absolute inset-0"
                    width={CROP_W}
                    height={CROP_H}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <mask id="crop-circle-mask">
                        <rect width={CROP_W} height={CROP_H} fill="white" />
                        <circle
                          cx={CROP_W / 2}
                          cy={CROP_H / 2}
                          r={Math.min(CROP_W, CROP_H) / 2 - 2}
                          fill="black"
                        />
                      </mask>
                    </defs>
                    <rect
                      width={CROP_W}
                      height={CROP_H}
                      fill="black"
                      fillOpacity={0.45}
                      mask="url(#crop-circle-mask)"
                    />
                    <circle
                      cx={CROP_W / 2}
                      cy={CROP_H / 2}
                      r={Math.min(CROP_W, CROP_H) / 2 - 2}
                      fill="none"
                      stroke="white"
                      strokeWidth={1.5}
                      strokeOpacity={0.55}
                    />
                  </svg>
                )}

                {/* Frame border */}
                <div className="pointer-events-none absolute inset-0 rounded-lg border border-white/30" />
              </div>

              {/* Zoom control */}
              <div className="flex w-full items-center gap-3">
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

              <p className={`text-xs ${subtextColor}`}>Drag to reposition · Scroll to zoom</p>
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
      )}
    </AnimatePresence>,
    document.body,
  );
}
