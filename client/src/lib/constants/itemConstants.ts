export const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"] as const;
export const COMBAT_TYPES = ["Melee", "Ranged"] as const;

export const RARITY_COLORS: Record<string, string> = {
  Common: "#9ca3af",
  Uncommon: "#10b981",
  Rare: "#3b82f6",
  Epic: "#8b5cf6",
  Legendary: "#f59e0b",
};

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
