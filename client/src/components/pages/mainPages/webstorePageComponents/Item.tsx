import { useState } from "react";
import type { Item as ItemType } from "@/types/PageTypes";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { useCart } from "./webstorePageLogic/useCart";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Minus, Plus, ShoppingCart } from "lucide-react";
import { RemoveItemButton } from "./RemoveItemButton";

const RARITY_COLORS: Record<string, string> = {
  Common: "#9ca3af",
  Uncommon: "#10b981",
  Rare: "#3b82f6",
  Epic: "#8b5cf6",
  Legendary: "#f59e0b",
};

interface ItemProps {
  item: ItemType;
  onDelete?: (id: string) => void;
}

export function Item({ item, onDelete }: ItemProps) {
  const { settings } = useSettings();
  const isAdmin = true;
  const { addToCart } = useCart();
  const glass = settings.useLiquidGlass;
  const rarityColor = RARITY_COLORS[item.rarity] ?? "#9ca3af";
  const [quantity, setQuantity] = useState(1);

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => q + 1);

  const handleAddToCart = () => {
    addToCart(item, quantity);
    setQuantity(1);
  };

  return (
    <Card
      className={`group relative overflow-hidden p-0 transition-all duration-200 h-full ${
        glass
          ? "bg-white/10 backdrop-blur-lg border border-white/15 shadow-lg shadow-black/5 hover:bg-white/15 hover:border-white/25 hover:shadow-xl hover:shadow-black/10"
          : "bg-gray-800/80 border border-gray-700 hover:border-gray-600 hover:bg-gray-800"
      }`}
    >
      {/* Admin delete button */}
      {isAdmin && onDelete && (
        <div className="absolute top-2 right-2 z-10">
          <RemoveItemButton onConfirm={() => onDelete(item.id)} />
        </div>
      )}

      {/* Accent bar on top */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
        style={{ backgroundColor: rarityColor }}
      />

      <div className="flex flex-col gap-3 p-5 pt-4">
        {/* Header: name + rarity badge */}
        <div
          className={`flex items-start justify-between gap-2 ${
            isAdmin && onDelete ? "pr-8" : ""
          }`}
        >
          <h3
            className={`text-sm font-semibold text-white leading-tight ${
              glass ? "[text-shadow:0_1px_4px_rgba(163,163,163,0.4)]" : ""
            }`}
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
          className={`text-xs text-white/50 leading-relaxed line-clamp-2 ${
            glass ? "[text-shadow:0_1px_2px_rgba(163,163,163,0.2)]" : ""
          }`}
        >
          {item.description}
        </p>

        {/* Footer: category + price */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
          <span
            className={`text-[10px] uppercase tracking-wider font-medium ${
              glass ? "text-white/40" : "text-gray-400"
            }`}
          >
            {item.category}
          </span>
          <div className="flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-400/80" />
            <span
              className={`text-sm font-bold ${
                glass
                  ? "text-white [text-shadow:0_1px_3px_rgba(163,163,163,0.3)]"
                  : "text-green-400"
              }`}
            >
              {item.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Quantity selector + Add to cart */}
        <div className="flex items-center gap-2 pt-1">
          <div
            className={`flex items-center rounded-lg border ${
              glass
                ? "border-white/15 bg-white/5"
                : "border-gray-600 bg-gray-700/40"
            }`}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10 rounded-r-none"
              onClick={decrement}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-xs font-medium w-7 text-center text-white select-none">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10 rounded-l-none"
              onClick={increment}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          <Button
            size="sm"
            className="flex-1 h-7 text-xs gap-1.5 bg-amber-500/90 text-black font-semibold hover:bg-amber-400 transition-colors"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-3 h-3" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
}
