import { useTranslation } from "react-i18next";
import type { WebstoreItem } from "@/types/PageTypes";
import { useSettings } from "@/pages/settings/SettingsContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Coins,
  Unlock,
  CheckCircle,
  Swords,
  Crosshair,
  Paintbrush,
  Loader2,
} from "lucide-react";
import { RemoveItemButton } from "./RemoveItemButton";
import {
  getBackgroundClasses,
  getTextColor,
  getTextShadow,
  getSubtextColor,
} from "@/lib/utils";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

const RARITY_COLORS: Record<string, string> = {
  Common: "#9ca3af",
  Uncommon: "#10b981",
  Rare: "#3b82f6",
  Epic: "#8b5cf6",
  Legendary: "#f59e0b",
};

interface ItemProps {
  item: WebstoreItem;
  onDelete?: (id: string) => void;
  onUnlock?: (id: string) => void;
  isDeleting?: boolean;
  isPurchasing?: boolean;
}

export function Item({
  item,
  onDelete,
  onUnlock,
  isDeleting = false,
  isPurchasing = false,
}: ItemProps) {
  const { settings } = useSettings();
  const { t } = useTranslation("webstore");
  const { isAdmin } = useContext(AuthContext);
  const rarityColor = RARITY_COLORS[item.rarity] ?? "#9ca3af";

  const bgClass = getBackgroundClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
    "light",
  );
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const textShadow = getTextShadow(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const subtextColor = getSubtextColor(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );

  const handleUnlock = () => {
    onUnlock?.(item.id);
  };

  return (
    <Card
      className={`group relative overflow-hidden p-0 transition-all duration-200 h-full ${bgClass} hover:shadow-xl`}
      style={
        item.owned
          ? {
              boxShadow: "inset 0 0 0 1px var(--theme-accent-soft)",
            }
          : undefined
      }
    >
      {/* Admin delete button */}
      {isAdmin && onDelete && (
        <div className="absolute top-2 right-2 z-10">
          <RemoveItemButton
            onConfirm={() => onDelete(item.id)}
            isDeleting={isDeleting}
          />
        </div>
      )}

      {/* Accent bar on top */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
        style={{ backgroundColor: rarityColor }}
      />

      <div className="flex flex-col gap-3 p-5 pt-4 h-full">
        {/* Header: name + rarity badge */}
        <div
          className={`flex items-start justify-between gap-2 ${
            isAdmin && onDelete ? "pr-8" : ""
          }`}
        >
          <h3
            className={`text-sm font-semibold ${textColor} leading-tight ${textShadow}`}
          >
            {item.name}
          </h3>
          <Badge
            className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0 shrink-0"
            style={{
              backgroundColor: `${rarityColor}20`,
              color: rarityColor,
              border: `1px solid ${rarityColor}40`,
            }}
          >
            {item.rarity}
          </Badge>
        </div>

        {/* Description */}
        <p
          className={`text-xs ${subtextColor} leading-relaxed line-clamp-2 min-h-10`}
        >
          {item.description}
        </p>

        {/* Footer: kind / combat type + price */}
        <div
          className={`flex items-center justify-between mt-auto pt-2 border-t ${
            settings.useLiquidGlass
              ? settings.useDarkMode
                ? "border-black/10"
                : "border-white/10"
              : settings.useDarkMode
                ? "border-gray-700/50"
                : "border-gray-300/50"
          }`}
        >
          <div className="flex items-center gap-1.5">
            {item.kind === "Character" ? (
              item.combatType === "Melee" ? (
                <Swords className="w-3 h-3 text-orange-400/70" />
              ) : (
                <Crosshair className="w-3 h-3 text-sky-400/70" />
              )
            ) : (
              <Paintbrush className="w-3 h-3 text-pink-400/70" />
            )}
            <span
              className={`text-[10px] uppercase tracking-wider font-medium ${subtextColor}`}
            >
              {item.kind === "Character" ? item.combatType : "Skin"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-400/80" />
            <span className={`text-sm font-bold text-amber-400 ${textShadow}`}>
              {item.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Unlock / Owned button */}
        <div className="pt-1">
          {item.owned ? (
            <div
              className="flex items-center justify-center gap-1.5 h-7 rounded-md text-xs font-medium border"
              style={{
                backgroundColor: "var(--theme-accent-soft)",
                borderColor: "var(--theme-accent)",
                color: settings.useDarkMode ? "#ffffff" : "var(--theme-accent)",
              }}
            >
              <CheckCircle className="w-3 h-3" />
              Owned
            </div>
          ) : (
            <Button
              size="sm"
              className="w-full h-7 text-xs gap-1.5 bg-amber-500/90 text-black font-semibold hover:bg-amber-400 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleUnlock}
              disabled={isPurchasing}
            >
              {isPurchasing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Unlock className="w-3 h-3" />
              )}
              {isPurchasing ? "Unlocking…" : "Unlock"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
