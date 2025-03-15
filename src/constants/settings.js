// Default app settings
export const DEFAULT_SETTINGS = {
  initialArcCount: 6,    // Starting number of arcs
  maxArcs: 21,           // Maximum number of arcs
  duration: 900,         // Total time for all dots to realign (in seconds)
  pulseEnabled: true,    // Whether or not to pulse opacity
  instrument: "vibraphone" // "default" | "wave" | "vibraphone"
};

// Audio settings
export const AUDIO_SETTINGS = {
  defaultVolume: 0.15,
  soundMapUrl: "https://assets.codepen.io/1468070/",
};

// Visual settings
export const VISUAL_SETTINGS = {
  baseCircleRadiusRatio: 0.006, // Base circle radius as a ratio of screen width
  initialRadiusRatio: 0.05,     // Initial arc radius as a ratio of screen width
  clearanceRatio: 0.03,         // Spacing clearance as a ratio of screen width
  centralLineOpacity: 0.3,      // Opacity of the central line
  centralLineColorHex: "#4dd0e1", // Color of central line
  impactThreshold: 0.05,        // Radians threshold for impact detection
  minImpactInterval: 500,       // Minimum ms between impacts
};

export default {
  DEFAULT_SETTINGS,
  AUDIO_SETTINGS,
  VISUAL_SETTINGS
};