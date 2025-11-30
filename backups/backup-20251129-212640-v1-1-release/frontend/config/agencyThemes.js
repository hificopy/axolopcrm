/**
 * Agency Theme Configuration
 *
 * Each agency can select ONE preset. The Default preset cannot be removed.
 * Themes only affect the sidebar/main layout gradient colors.
 */

// Theme presets available for agencies
export const THEME_PRESETS = {
  default: {
    id: "default",
    name: "Default",
    description: "Axolop signature dark plum theme",
    isRemovable: false, // Cannot be deleted - this is the main branding
    colors: {
      // HSL values matching new Dark Plum palette
      gradientStart: "0 0% 4%", // Near black #0a0a0a
      gradientMid: "330 65% 10%", // Dark pink #1a0812
      gradientEnd: "330 65% 15%", // Dark plum #3F0D28
      hover: "330 65% 12%", // Plum hover #2D0A1E
      active: "330 65% 15%", // Dark plum #3F0D28
      accent: "#3F0D28", // Primary accent color (hex for indicators)
    },
  },
  ocean: {
    id: "ocean",
    name: "Ocean Blue",
    description: "Deep sea blues",
    isRemovable: true,
    colors: {
      gradientStart: "210 80% 8%", // Deep navy
      gradientMid: "210 60% 6%", // Dark blue-black
      gradientEnd: "210 70% 12%", // Blue accent
      hover: "210 60% 18%", // Blue hover
      active: "210 80% 35%", // Bright blue accent
      accent: "#1E40AF",
    },
  },
  emerald: {
    id: "emerald",
    name: "Emerald",
    description: "Rich forest greens",
    isRemovable: true,
    colors: {
      gradientStart: "160 80% 6%", // Deep forest
      gradientMid: "160 50% 5%", // Dark green-black
      gradientEnd: "160 60% 10%", // Green accent
      hover: "160 50% 15%", // Green hover
      active: "160 70% 30%", // Emerald accent
      accent: "#047857",
    },
  },
  purple: {
    id: "purple",
    name: "Royal Purple",
    description: "Elegant purple tones",
    isRemovable: true,
    colors: {
      gradientStart: "270 80% 8%", // Deep purple
      gradientMid: "270 50% 6%", // Dark purple-black
      gradientEnd: "270 60% 12%", // Purple accent
      hover: "270 50% 18%", // Purple hover
      active: "270 70% 35%", // Bright purple
      accent: "#7C3AED",
    },
  },
  sunset: {
    id: "sunset",
    name: "Sunset Orange",
    description: "Warm sunset colors",
    isRemovable: true,
    colors: {
      gradientStart: "25 85% 8%", // Deep orange-brown
      gradientMid: "25 60% 6%", // Dark warm black
      gradientEnd: "25 70% 12%", // Orange accent
      hover: "25 60% 18%", // Orange hover
      active: "25 80% 35%", // Bright orange
      accent: "#EA580C",
    },
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    description: "Pure dark theme",
    isRemovable: true,
    colors: {
      gradientStart: "0 0% 4%", // Near black
      gradientMid: "0 0% 3%", // Pure dark
      gradientEnd: "0 0% 6%", // Slight gray
      hover: "0 0% 12%", // Gray hover
      active: "0 0% 25%", // Gray accent
      accent: "#404040",
    },
  },
  rose: {
    id: "rose",
    name: "Rose Gold",
    description: "Elegant pink tones",
    isRemovable: true,
    colors: {
      gradientStart: "350 70% 10%", // Deep rose
      gradientMid: "350 50% 6%", // Dark rose-black
      gradientEnd: "350 60% 14%", // Rose accent
      hover: "350 50% 20%", // Rose hover
      active: "350 70% 40%", // Bright rose
      accent: "#DB2777",
    },
  },
  teal: {
    id: "teal",
    name: "Teal",
    description: "Modern teal accent",
    isRemovable: true,
    colors: {
      gradientStart: "180 70% 7%", // Deep teal
      gradientMid: "180 50% 5%", // Dark teal-black
      gradientEnd: "180 60% 11%", // Teal accent
      hover: "180 50% 16%", // Teal hover
      active: "180 70% 32%", // Bright teal
      accent: "#0D9488",
    },
  },
};

// Get all preset IDs
export const getPresetIds = () => Object.keys(THEME_PRESETS);

// Get a specific preset by ID
export const getPreset = (presetId) =>
  THEME_PRESETS[presetId] || THEME_PRESETS.default;

// Get the default preset
export const getDefaultPreset = () => THEME_PRESETS.default;

// Check if a preset can be removed
export const isPresetRemovable = (presetId) => {
  const preset = THEME_PRESETS[presetId];
  return preset ? preset.isRemovable : true;
};

// Generate CSS variables from a theme preset
export const generateThemeCSS = (presetId) => {
  const preset = getPreset(presetId);
  return {
    "--crm-sidebar-gradient-start": preset.colors.gradientStart,
    "--crm-sidebar-gradient-mid": preset.colors.gradientMid,
    "--crm-sidebar-gradient-end": preset.colors.gradientEnd,
    "--crm-sidebar-hover": preset.colors.hover,
    "--crm-sidebar-active": preset.colors.active,
  };
};

export default THEME_PRESETS;
