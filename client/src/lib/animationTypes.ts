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

export const ALL_ANIMATION_KEYS = Object.keys(ANIMATION_LABELS) as AnimationKey[];

// ── Sub-effect interfaces ────────────────────────────────────────────────────

export interface StormSubEffects {
  showRain: boolean;
  showLightning: boolean;
  showClouds: boolean;
  showGroundShimmer: boolean;
}
export interface FishtankSubEffects {
  showFish: boolean;
  showBubbles: boolean;
  showSeaweed: boolean;
  showCaustics: boolean;
  showLightShafts: boolean;
}
export interface DeepSpaceSubEffects {
  showStars: boolean;
  showMilkyWay: boolean;
  showNebulae: boolean;
  showShootingStars: boolean;
}
export interface AuroraSubEffects {
  showColorBands: boolean;
  showFibers: boolean;
  showStars: boolean;
  showMoon: boolean;
}
export interface LavaLampSubEffects {
  showBlobs: boolean;
  showHighlight: boolean;
}
export interface SynthwaveSubEffects {
  showSky: boolean;
  showSun: boolean;
  showGrid: boolean;
  showScanlines: boolean;
}
export interface SakuraSubEffects {
  showPetals: boolean;
  showBokeh: boolean;
}
export interface ParticleWebSubEffects {
  showParticles: boolean;
  showConnections: boolean;
}
export interface PuddleRipplesSubEffects {
  showRipples: boolean;
}
export interface BioluminescenceSubEffects {
  showOrbs: boolean;
  showPulses: boolean;
  showVignette: boolean;
}
export interface ConstellationSubEffects {
  showStars: boolean;
  showConstellationLines: boolean;
}
export interface VoidSubEffects {
  showDepthBlobs: boolean;
  showJellyfish: boolean;
  showAmbientOrbs: boolean;
  showMarineSnow: boolean;
}

export type SubEffectMap = {
  storm: StormSubEffects;
  fishtank: FishtankSubEffects;
  deepspace: DeepSpaceSubEffects;
  aurora: AuroraSubEffects;
  lavalamp: LavaLampSubEffects;
  synthwave: SynthwaveSubEffects;
  sakura: SakuraSubEffects;
  particleweb: ParticleWebSubEffects;
  puddleripples: PuddleRipplesSubEffects;
  bioluminescence: BioluminescenceSubEffects;
  constellation: ConstellationSubEffects;
  void: VoidSubEffects;
};

// Presence of a key = effect is enabled; absence = disabled
export type EffectLayerConfig = Partial<SubEffectMap>;

export const DEFAULT_SUB_EFFECTS: SubEffectMap = {
  storm: { showRain: true, showLightning: true, showClouds: true, showGroundShimmer: true },
  fishtank: {
    showFish: true,
    showBubbles: true,
    showSeaweed: true,
    showCaustics: true,
    showLightShafts: true,
  },
  deepspace: { showStars: true, showMilkyWay: true, showNebulae: true, showShootingStars: true },
  aurora: { showColorBands: true, showFibers: true, showStars: true, showMoon: true },
  lavalamp: { showBlobs: true, showHighlight: true },
  synthwave: { showSky: true, showSun: true, showGrid: true, showScanlines: true },
  sakura: { showPetals: true, showBokeh: true },
  particleweb: { showParticles: true, showConnections: true },
  puddleripples: { showRipples: true },
  bioluminescence: { showOrbs: true, showPulses: true, showVignette: true },
  constellation: { showStars: true, showConstellationLines: true },
  void: { showDepthBlobs: true, showJellyfish: true, showAmbientOrbs: true, showMarineSnow: true },
};

export const SUB_EFFECT_LABELS: { [K in AnimationKey]: Record<keyof SubEffectMap[K], string> } = {
  storm: {
    showRain: "Rain",
    showLightning: "Lightning",
    showClouds: "Clouds",
    showGroundShimmer: "Ground Shimmer",
  },
  fishtank: {
    showFish: "Fish",
    showBubbles: "Bubbles",
    showSeaweed: "Seaweed",
    showCaustics: "Caustics",
    showLightShafts: "Light Shafts",
  },
  deepspace: {
    showStars: "Stars",
    showMilkyWay: "Milky Way",
    showNebulae: "Nebulae",
    showShootingStars: "Shooting Stars",
  },
  aurora: {
    showColorBands: "Color Bands",
    showFibers: "Fibers",
    showStars: "Stars",
    showMoon: "Moon",
  },
  lavalamp: { showBlobs: "Blobs", showHighlight: "Highlight" },
  synthwave: { showSky: "Sky", showSun: "Sun", showGrid: "Grid", showScanlines: "Scanlines" },
  sakura: { showPetals: "Petals", showBokeh: "Bokeh" },
  particleweb: { showParticles: "Particles", showConnections: "Connections" },
  puddleripples: { showRipples: "Ripples" },
  bioluminescence: { showOrbs: "Orbs", showPulses: "Pulses", showVignette: "Vignette" },
  constellation: { showStars: "Stars", showConstellationLines: "Constellation Lines" },
  void: {
    showDepthBlobs: "Depth Blobs",
    showJellyfish: "Jellyfish",
    showAmbientOrbs: "Ambient Orbs",
    showMarineSnow: "Marine Snow",
  },
};

export function hasEnabledEffects(config: EffectLayerConfig): boolean {
  return Object.keys(config).length > 0;
}
