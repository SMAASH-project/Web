import { useCallback, useContext, useMemo, useState } from "react";
import { ColorContext } from "@/pages/settings/ColorContext";
import {
  ALL_ANIMATION_KEYS,
  ANIMATION_LABELS,
  DEFAULT_SUB_EFFECTS,
  SUB_EFFECT_LABELS,
  type AnimationKey,
  type EffectLayerConfig,
} from "@/lib/animationTypes";
import { CompositeBackground } from "@/backgrounds/CompositeBackground";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { getButtonClasses, getDialogClasses, getTextColor, getTextShadow } from "@/lib/utils";
import { useSettings } from "@/pages/settings/SettingsContext";

export function EffectMixDialog() {
  const context = useContext(ColorContext);
  const { settings, updateSetting } = useSettings();
  const [open, setOpen] = useState(false);
  const [pendingMix, setPendingMix] = useState<EffectLayerConfig>({});
  const [openItems, setOpenItems] = useState<string[]>([]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        const initialMix = context?.effectMix ?? {};
        setPendingMix(initialMix);
        setOpenItems(Object.keys(initialMix));
      }
      setOpen(isOpen);
    },
    [context?.effectMix],
  );

  const toggleEffect = useCallback(
    (key: AnimationKey) => {
      const isEnabled = key in pendingMix;
      if (isEnabled) {
        setPendingMix((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        setOpenItems((items) => items.filter((i) => i !== key));
      } else {
        setPendingMix((prev) => ({
          ...prev,
          [key]: { ...DEFAULT_SUB_EFFECTS[key] },
        }));
        setOpenItems((items) => [...items, key]);
      }
    },
    [pendingMix],
  );

  const toggleSubEffect = useCallback((effectKey: AnimationKey, subKey: string) => {
    setPendingMix((prev) => {
      const current = (prev[effectKey] ?? DEFAULT_SUB_EFFECTS[effectKey]) as unknown as Record<
        string,
        boolean
      >;
      return {
        ...prev,
        [effectKey]: { ...current, [subKey]: !current[subKey] },
      } as EffectLayerConfig;
    });
  }, []);

  const handleApply = useCallback(() => {
    const hasEffects = Object.keys(pendingMix).length > 0;
    context?.setEffectMix(hasEffects ? pendingMix : null);
    if (hasEffects) {
      updateSetting("animationOverride", "custom");
    } else if (settings.animationOverride === "custom") {
      updateSetting("animationOverride", null);
    }
    setOpen(false);
  }, [context, pendingMix, settings.animationOverride, updateSetting]);

  const handleClear = useCallback(() => {
    context?.setEffectMix(null);
    if (settings.animationOverride === "custom") {
      updateSetting("animationOverride", null);
    }
    setOpen(false);
  }, [context, settings.animationOverride, updateSetting]);

  const { textColor, textShadow, buttonClass, dialogClass } = useMemo(
    () => ({
      textColor: getTextColor(settings.useLiquidGlass, settings.useDarkMode),
      textShadow: getTextShadow(settings.useLiquidGlass, settings.useDarkMode),
      buttonClass: getButtonClasses(settings.useLiquidGlass, settings.useDarkMode),
      dialogClass: getDialogClasses(settings.useLiquidGlass, settings.useDarkMode),
    }),
    [settings.useLiquidGlass, settings.useDarkMode],
  );

  const colorLeft = context?.colorLeft ?? "#616161";
  const colorMiddle = context?.colorMiddle ?? "#000000";
  const colorRight = context?.colorRight ?? "#616161";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className={`cursor-pointer ${buttonClass} ${textShadow}`}>Mix Effects</Button>
      </DialogTrigger>
      <DialogContent className={`sm:max-w-2xl ${dialogClass} ${textColor}`}>
        <DialogHeader>
          <DialogTitle className={textColor}>Mix Effects</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-100 gap-4">
          {/* Left — effect accordion list */}
          <div className="max-h-[60vh] min-w-0 flex-1 overflow-y-auto pr-1">
            <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
              {ALL_ANIMATION_KEYS.map((key) => {
                const isEnabled = key in pendingMix;
                const subLabels = SUB_EFFECT_LABELS[key] as Record<string, string>;
                const subValues = (isEnabled
                  ? pendingMix[key]
                  : DEFAULT_SUB_EFFECTS[key]) as unknown as Record<string, boolean>;

                return (
                  <AccordionItem key={key} value={key} className="border-white/20">
                    <AccordionTrigger className={`gap-2 hover:no-underline ${textColor}`}>
                      <Switch
                        size="sm"
                        checked={isEnabled}
                        onCheckedChange={() => toggleEffect(key)}
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0"
                      />
                      <span className="text-sm font-medium">{ANIMATION_LABELS[key]}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-2 pb-1 pl-8">
                        {Object.entries(subLabels).map(([subKey, label]) => (
                          <div
                            key={subKey}
                            className={`flex items-center gap-2 transition-opacity ${
                              !isEnabled ? "pointer-events-none opacity-40" : ""
                            }`}
                          >
                            <Switch
                              size="sm"
                              checked={subValues[subKey] ?? true}
                              onCheckedChange={() => toggleSubEffect(key, subKey)}
                            />
                            <span className={`text-xs ${textColor}`}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>

          {/* Right — live preview (paused) */}
          <div
            className="relative w-80 shrink-0 self-stretch overflow-hidden rounded-lg"
            style={{
              backgroundImage: `linear-gradient(to right, ${colorLeft}, ${colorMiddle}, ${colorRight})`,
            }}
          >
            <CompositeBackground
              effectMix={pendingMix}
              colorLeft={colorLeft}
              colorMiddle={colorMiddle}
              colorRight={colorRight}
              paused={false}
              preview={true}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className={`cursor-pointer ${buttonClass}`}
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button className={`cursor-pointer ${buttonClass}`} onClick={handleApply}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
