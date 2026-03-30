export type AnimationKey =
  | "fishtank"
  | "deepspace"
  | "aurora"
  | "lavalamp"
  | "synthwave"
  | "sakura"
  | "storm"
  | "particleweb"
  | "puddleripples"
  | "bioluminescence"
  | "constellation"
  | "void";

export const ANIMATION_LABELS: Record<AnimationKey, string> = {
  fishtank: "Fishtank",
  deepspace: "Deep Space",
  aurora: "Aurora",
  lavalamp: "Lava Lamp",
  synthwave: "Synthwave",
  sakura: "Sakura",
  storm: "Storm",
  particleweb: "Particle Web",
  puddleripples: "Puddle Ripples",
  bioluminescence: "Bioluminescence",
  constellation: "Constellation",
  void: "Void",
};

export const ALL_ANIMATION_KEYS = Object.keys(
  ANIMATION_LABELS,
) as AnimationKey[];
