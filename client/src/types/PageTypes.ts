import { DateTime } from "luxon";

export const CATEGORY_COLORS: Record<string, string> = {
  "Major update": "#3b82f6",
  "Minor update": "#10b981",
  Patch: "#f59e0b",
  "Unrelated news": "#8b5cf6",
};

export interface NewsPost {
  id: string;
  title: string;
  category: "Major update" | "Minor update" | "Patch" | "Unrelated news";
  image?: string;
  imageAlt?: string;
  imagePosition?: "Top" | "Right";
  imageSize?: number;
  content: string;
  createdAt: DateTime;
}

export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export interface WebstoreItem {
  id: string;
  name: string;
  kind: "Character";
  combatType?: "Melee" | "Ranged";
  rarity: Rarity;
  description: string;
  price: number;
  owned: boolean;
  createdAt: DateTime;
  imgUri: string;
}

export interface Release {
  id: string;
  version: string;
  supports: string[];
  /**
   * Per-platform direct download URLs derived from GitHub release assets.
   * Keys match OsTypes names exactly: "iOS" | "Android"
   * A key is absent when no matching asset exists for that platform.
   *
   * Example:
   *   { iOS: "https://github.com/.../smaash-v1.2.3-ios.ipa",
   *     Android: "https://github.com/.../smaash-v1.2.3-android.apk" }
   */
  downloadUrls: Partial<Record<string, string>>;
  createdAt: DateTime;
}
