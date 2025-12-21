import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";

export type MetalTheme =
  | "classic-metal"
  | "black-metal"
  | "death-metal"
  | "power-metal"
  | "doom-metal"
  | "thrash-metal"
  | "gothic-metal"
  | "light-mode"
  | "dark-mode"
  | "glassmorphism-premium";

interface ThemeColors {
  primary: string;
  primaryDark?: string;
  primaryText?: string; // Text color to use on primary background
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  card: string;
  cardBackground: string;
}

interface MetalThemeConfig {
  name: string;
  description: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  gradient: string;
  isPremium?: boolean;
}

export const METAL_THEMES: Record<MetalTheme, MetalThemeConfig> = {
  "classic-metal": {
    name: "Classic Metal",
    description: "Traditional orange and black metal aesthetic",
    colors: {
      dark: {
        primary: "#ff6b35",
        primaryDark: "#e55a2b",
        primaryText: "#ffffff",
        secondary: "#ff8c42",
        accent: "#ff6b35",
        background: "#000000",
        surface: "#1a1a1a",
        text: "#ffffff",
        textSecondary: "#cccccc",
        textMuted: "#999999",
        border: "#333333",
        card: "#1a1a1a",
        cardBackground: "#1a1a1a",
      },
      light: {
        primary: "#d4510a",
        primaryDark: "#b8450a",
        primaryText: "#ffffff",
        secondary: "#e8630e",
        accent: "#d4510a",
        background: "#000000",
        surface: "#1a1a1a",
        text: "#ffffff",
        textSecondary: "#cccccc",
        textMuted: "#999999",
        border: "#333333",
        card: "#1a1a1a",
        cardBackground: "#1a1a1a",
      },
    },
    gradient: "linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)",
  },
  "black-metal": {
    name: "Black Metal",
    description: "Dark, atmospheric with silver accents",
    colors: {
      dark: {
        primary: "#c0c0c0",
        primaryDark: "#a0a0a0",
        primaryText: "#000000", // Black text on silver/white background
        secondary: "#8b8b8b",
        accent: "#ffffff",
        background: "#0a0a0a",
        surface: "#1a1a1a",
        text: "#f0f0f0",
        textSecondary: "#d0d0d0",
        textMuted: "#a0a0a0",
        border: "#333333",
        card: "#1a1a1a",
        cardBackground: "#1a1a1a",
      },
      light: {
        primary: "#666666",
        primaryDark: "#555555",
        primaryText: "#ffffff", // White text on dark background
        secondary: "#888888",
        accent: "#333333",
        background: "#0a0a0a",
        surface: "#1a1a1a",
        text: "#f0f0f0",
        textSecondary: "#d0d0d0",
        textMuted: "#a0a0a0",
        border: "#333333",
        card: "#1a1a1a",
        cardBackground: "#1a1a1a",
      },
    },
    gradient: "linear-gradient(135deg, #c0c0c0 0%, #8b8b8b 100%)",
  },
  "death-metal": {
    name: "Death Metal",
    description: "Blood red with dark crimson tones",
    colors: {
      dark: {
        primary: "#dc143c",
        secondary: "#b71c1c",
        accent: "#ff1744",
        background: "#0d0000",
        surface: "#1a0505",
        text: "#ffcccc",
        textSecondary: "#ff9999",
        textMuted: "#cc6666",
        border: "#4d1414",
        card: "#1a0505",
        cardBackground: "#1a0505",
      },
      light: {
        primary: "#c62828",
        secondary: "#d32f2f",
        accent: "#f44336",
        background: "#0d0000",
        surface: "#1a0505",
        text: "#ffcccc",
        textSecondary: "#ff9999",
        textMuted: "#cc6666",
        border: "#4d1414",
        card: "#1a0505",
        cardBackground: "#1a0505",
      },
    },
    gradient: "linear-gradient(135deg, #dc143c 0%, #b71c1c 100%)",
  },
  "power-metal": {
    name: "Power Metal",
    description: "Epic gold and blue fantasy theme",
    colors: {
      dark: {
        primary: "#ffd700",
        primaryText: "#000000", // Black text on yellow background
        secondary: "#4169e1",
        accent: "#87ceeb",
        background: "#0a0a1a",
        surface: "#1a1a2e",
        text: "#ffffff",
        textSecondary: "#f0f8ff",
        textMuted: "#ddeeff",
        border: "#2a2a5a",
        card: "#1a1a2e",
        cardBackground: "#1a1a2e",
      },
      light: {
        primary: "#ffb300",
        primaryText: "#000000", // Black text on yellow background
        secondary: "#1976d2",
        accent: "#0277bd",
        background: "#0a0a1a",
        surface: "#1a1a2e",
        text: "#ffffff",
        textSecondary: "#f0f8ff",
        textMuted: "#ddeeff",
        border: "#2a2a5a",
        card: "#1a1a2e",
        cardBackground: "#1a1a2e",
      },
    },
    gradient: "linear-gradient(135deg, #ffd700 0%, #4169e1 100%)",
  },
  "doom-metal": {
    name: "Doom Metal",
    description: "Earth tones with deep greens and browns",
    colors: {
      dark: {
        primary: "#8b4513",
        secondary: "#2e7d32",
        accent: "#ff8f00",
        background: "#0a0a0a",
        surface: "#1a1a0a",
        text: "#f0e68c",
        textSecondary: "#daa520",
        textMuted: "#b8860b",
        border: "#3e2723",
        card: "#1a1a0a",
        cardBackground: "#1a1a0a",
      },
      light: {
        primary: "#6d4c41",
        secondary: "#388e3c",
        accent: "#ff9800",
        background: "#0a0a0a",
        surface: "#1a1a0a",
        text: "#f0e68c",
        textSecondary: "#daa520",
        textMuted: "#b8860b",
        border: "#3e2723",
        card: "#1a1a0a",
        cardBackground: "#1a1a0a",
      },
    },
    gradient: "linear-gradient(135deg, #8b4513 0%, #2e7d32 100%)",
  },
  "thrash-metal": {
    name: "Thrash Metal",
    description: "Electric yellow and purple high energy",
    colors: {
      dark: {
        primary: "#ffeb3b",
        primaryText: "#000000",
        secondary: "#9c27b0",
        accent: "#e91e63",
        background: "#0a0a0a",
        surface: "#1a0a1a",
        text: "#ffffff",
        textSecondary: "#fff9c4",
        textMuted: "#f4ff81",
        border: "#4a148c",
        card: "#1a0a1a",
        cardBackground: "#1a0a1a",
      },
      light: {
        primary: "#f57f17",
        primaryText: "#000000",
        secondary: "#7b1fa2",
        accent: "#c2185b",
        background: "#0a0a0a",
        surface: "#1a0a1a",
        text: "#ffffff",
        textSecondary: "#fff9c4",
        textMuted: "#f4ff81",
        border: "#4a148c",
        card: "#1a0a1a",
        cardBackground: "#1a0a1a",
      },
    },
    gradient: "linear-gradient(135deg, #ffeb3b 0%, #9c27b0 100%)",
  },
  "gothic-metal": {
    name: "Gothic Metal",
    description: "Deep purple and dark rose elegance",
    colors: {
      dark: {
        primary: "#9c27b0",
        secondary: "#ad1457",
        accent: "#e1bee7",
        background: "#0a0a0a",
        surface: "#1a0a1a",
        text: "#f3e5f5",
        textSecondary: "#e1bee7",
        textMuted: "#b868cc",
        border: "#4a148c",
        card: "#1a0a1a",
        cardBackground: "#1a0a1a",
      },
      light: {
        primary: "#7b1fa2",
        secondary: "#c2185b",
        accent: "#e91e63",
        background: "#0a0a0a",
        surface: "#1a0a1a",
        text: "#f3e5f5",
        textSecondary: "#e1bee7",
        textMuted: "#b868cc",
        border: "#4a148c",
        card: "#1a0a1a",
        cardBackground: "#1a0a1a",
      },
    },
    gradient: "linear-gradient(135deg, #9c27b0 0%, #ad1457 100%)",
  },
  "light-mode": {
    name: "Light Mode",
    description: "Clean and bright classic light theme",
    colors: {
      dark: {
        primary: "#2563eb",
        secondary: "#3b82f6",
        accent: "#60a5fa",
        background: "#000000",
        surface: "#1a1a1a",
        text: "#ffffff",
        textSecondary: "#cccccc",
        textMuted: "#999999",
        border: "#333333",
        card: "#1a1a1a",
        cardBackground: "#1a1a1a",
      },
      light: {
        primary: "#2563eb",
        primaryDark: "#1d4ed8",
        primaryText: "#ffffff",
        secondary: "#3b82f6",
        accent: "#60a5fa",
        background: "#ffffff",
        surface: "#f8fafc",
        text: "#0f172a", // Darker text for better contrast
        textSecondary: "#334155", // Darker secondary text
        textMuted: "#475569", // Darker muted text
        border: "#cbd5e1", // Darker border for better visibility
        card: "#ffffff",
        cardBackground: "#ffffff",
      },
    },
    gradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  },
  "dark-mode": {
    name: "Dark Mode",
    description: "Sleek and modern classic dark theme",
    colors: {
      dark: {
        primary: "#60a5fa",
        secondary: "#3b82f6",
        accent: "#93c5fd",
        background: "#0f172a",
        surface: "#1e293b",
        text: "#f1f5f9",
        textSecondary: "#cbd5e1",
        textMuted: "#64748b",
        border: "#334155",
        card: "#1e293b",
        cardBackground: "#1e293b",
      },
      light: {
        primary: "#60a5fa",
        secondary: "#3b82f6",
        accent: "#93c5fd",
        background: "#0f172a",
        surface: "#1e293b",
        text: "#f1f5f9",
        textSecondary: "#cbd5e1",
        textMuted: "#64748b",
        border: "#334155",
        card: "#1e293b",
        cardBackground: "#1e293b",
      },
    },
    gradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
  },
  "glassmorphism-premium": {
    name: "Glassmorphism Rock",
    description: "Premium vibrant glass effect with rock vibes",
    colors: {
      dark: {
        primary: "#ff0080",
        primaryDark: "#e6006b",
        primaryText: "#ffffff",
        secondary: "#ff6600",
        accent: "#ffff00",
        background: "#0a0a0a",
        surface: "rgba(0, 0, 0, 0.25)",
        text: "#ffffff",
        textSecondary: "#f0f0f0",
        textMuted: "#e0e0e0",
        border: "rgba(255, 255, 255, 0.25)",
        card: "rgba(0, 0, 0, 0.15)",
        cardBackground: "rgba(0, 0, 0, 0.15)",
      },
      light: {
        primary: "#ff0080",
        primaryDark: "#e6006b",
        primaryText: "#ffffff",
        secondary: "#ff6600",
        accent: "#ffff00",
        background: "#0a0a0a",
        surface: "rgba(0, 0, 0, 0.25)",
        text: "#ffffff",
        textSecondary: "#f0f0f0",
        textMuted: "#e0e0e0",
        border: "rgba(255, 255, 255, 0.25)",
        card: "rgba(0, 0, 0, 0.15)",
        cardBackground: "rgba(0, 0, 0, 0.15)",
      },
    },
    gradient:
      "linear-gradient(135deg, #8b0080 0%, #ff0080 25%, #ff6600 50%, #ffff00 75%, #ff0080 100%)",
    isPremium: true,
  },
  "glam": {
    name: "Glam",
    description: "Premium neon blue and cyan",
    colors: {
      dark: {
        primary: "#00D4FF",
        primaryDark: "#0099CC",
        primaryText: "#000000",
        secondary: "#5200FF",
        accent: "#00D4FF",
        background: "#000000",
        surface: "#0a0a1a",
        text: "#ffffff",
        textSecondary: "#e0f7ff",
        textMuted: "#8cbfff",
        border: "#003d66",
        card: "#0a0a1a",
        cardBackground: "#0a0a1a",
      },
      light: {
        primary: "#0099CC",
        primaryDark: "#006699",
        primaryText: "#ffffff",
        secondary: "#3d00cc",
        accent: "#0099CC",
        background: "#000000",
        surface: "#0a0a1a",
        text: "#ffffff",
        textSecondary: "#e0f7ff",
        textMuted: "#8cbfff",
        border: "#003d66",
        card: "#0a0a1a",
        cardBackground: "#0a0a1a",
      },
    },
    gradient: "linear-gradient(135deg, #00D4FF 0%, #5200FF 100%)",
    isPremium: true,
  },
  "rebel": {
    name: "Rebel",
    description: "Premium purple and pink neon",
    colors: {
      dark: {
        primary: "#B56BFF",
        primaryDark: "#9944FF",
        primaryText: "#ffffff",
        secondary: "#FF50C3",
        accent: "#FF50C3",
        background: "#000000",
        surface: "#1a0a2e",
        text: "#ffffff",
        textSecondary: "#f0d9ff",
        textMuted: "#c9a6ff",
        border: "#4d2080",
        card: "#1a0a2e",
        cardBackground: "#1a0a2e",
      },
      light: {
        primary: "#9944FF",
        primaryDark: "#7722dd",
        primaryText: "#ffffff",
        secondary: "#dd0088",
        accent: "#dd0088",
        background: "#000000",
        surface: "#1a0a2e",
        text: "#ffffff",
        textSecondary: "#f0d9ff",
        textMuted: "#c9a6ff",
        border: "#4d2080",
        card: "#1a0a2e",
        cardBackground: "#1a0a2e",
      },
    },
    gradient: "linear-gradient(135deg, #B56BFF 0%, #FF50C3 100%)",
    isPremium: true,
  },
  "shredweisen": {
    name: "ShredWeisen",
    description: "Premium orange, pink and purple neon",
    colors: {
      dark: {
        primary: "#E520C6",
        primaryDark: "#cc00bb",
        primaryText: "#ffffff",
        secondary: "#F4654F",
        accent: "#FF8C42",
        background: "#000000",
        surface: "#2e0a1a",
        text: "#ffffff",
        textSecondary: "#ffd9cc",
        textMuted: "#ffaa88",
        border: "#664d33",
        card: "#2e0a1a",
        cardBackground: "#2e0a1a",
      },
      light: {
        primary: "#cc00bb",
        primaryDark: "#bb0099",
        primaryText: "#ffffff",
        secondary: "#ff5533",
        accent: "#ff7744",
        background: "#000000",
        surface: "#2e0a1a",
        text: "#ffffff",
        textSecondary: "#ffd9cc",
        textMuted: "#ffaa88",
        border: "#664d33",
        card: "#2e0a1a",
        cardBackground: "#2e0a1a",
      },
    },
    gradient: "linear-gradient(135deg, #E520C6 0%, #F4654F 50%, #FF8C42 100%)",
    isPremium: true,
  },
};

interface ThemeContextType {
  currentTheme: MetalTheme;
  isDarkMode: boolean;
  colors: ThemeColors;
  theme: MetalThemeConfig;
  setTheme: (theme: MetalTheme) => void;
  toggleDarkMode: () => void;
  toggleTheme: () => void;
  gradient: string;
  getColors: () => ThemeColors;
  getGradient: () => string;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<MetalTheme>(() => {
    try {
      const saved = localStorage.getItem("metal-theme") as MetalTheme;
      const validTheme = saved && METAL_THEMES[saved] ? saved : "classic-metal";
      console.log('[ThemeContext] Initializing with theme:', validTheme);
      return validTheme;
    } catch (error) {
      console.error('[ThemeContext] Error reading theme from localStorage:', error);
      return "classic-metal";
    }
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("theme-mode");
      const isDark = saved === "light" ? false : true;
      console.log('[ThemeContext] Initializing with dark mode:', isDark);
      return isDark;
    } catch (error) {
      console.error('[ThemeContext] Error reading dark mode from localStorage:', error);
      return true;
    }
  });

  // Ensure currentTheme is always defined
  if (!currentTheme || !METAL_THEMES[currentTheme]) {
    console.error('[ThemeContext] Invalid currentTheme detected:', currentTheme);
    setCurrentTheme("classic-metal");
  }

  // Debug logging
  useEffect(() => {
    console.log('[ThemeContext] Theme changed to:', currentTheme);
  }, [currentTheme]);

  // Ensure currentTheme is always valid
  useEffect(() => {
    if (!currentTheme || !METAL_THEMES[currentTheme]) {
      console.error('[ThemeContext] Invalid currentTheme detected, resetting to classic-metal:', currentTheme);
      setCurrentTheme("classic-metal");
    }
  }, [currentTheme]);

  useEffect(() => {
    console.log('[ThemeContext] isDarkMode changed to:', isDarkMode);
  }, [isDarkMode]);

  // Helper function to get theme colors
  const getThemeColors = (themeName: MetalTheme, isDark: boolean): ThemeColors => {
    try {
      const theme = METAL_THEMES[themeName];
      if (!theme) {
        console.error('[ThemeContext] Theme not found:', themeName);
        return METAL_THEMES["classic-metal"].colors[isDark ? "dark" : "light"];
      }
      return isDark ? theme.colors.dark : theme.colors.light;
    } catch (error) {
      console.error('[ThemeContext] Error getting theme colors:', error);
      return METAL_THEMES["classic-metal"].colors[isDark ? "dark" : "light"];
    }
  };

  // Helper function to convert colors to HSL
  const colorToHsl = (color: string) => {
    // Handle rgba colors
    if (color.startsWith('rgba(')) {
      const rgba = color.match(/rgba?\(([^)]+)\)/)?.[1].split(',').map(x => parseFloat(x.trim()));
      if (!rgba || rgba.length < 3) return "0 0% 50%";
      const [r, g, b] = rgba.map(x => x / 255);
      return rgbToHsl(r, g, b);
    }

    // Handle hex colors
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (!result) return "0 0% 50%";

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    return rgbToHsl(r, g, b);
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
  };

  // Memoize colors to prevent unnecessary recalculations
  const colors = useMemo(() => {
    return getThemeColors(currentTheme, isDarkMode);
  }, [currentTheme, isDarkMode]);

  // Memoize theme config to prevent unnecessary object creation
  const themeConfig = useMemo(() => {
    return METAL_THEMES[currentTheme];
  }, [currentTheme]);

  // Optimized theme switching with minimal DOM manipulation
  useEffect(() => {
    const root = document.documentElement;
    
    // Batch all CSS variable updates
    const cssVariables = {
      "--tw-bg": colorToHsl(colors.background),
      "--tw-surface": colorToHsl(colors.surface),
      "--tw-text": colorToHsl(colors.text),
      "--tw-text-secondary": colorToHsl(colors.textSecondary),
      "--tw-text-muted": colorToHsl(colors.textMuted),
      "--tw-primary": colorToHsl(colors.primary),
      "--tw-secondary": colorToHsl(colors.secondary),
      "--tw-accent": colorToHsl(colors.accent),
      "--tw-border": colorToHsl(colors.border),
      "--tw-muted": colorToHsl(colors.surface),
      "--tw-muted-foreground": colorToHsl(colors.textMuted),
      "--background": colorToHsl(colors.background),
      "--card": colorToHsl(colors.card),
      "--foreground": colorToHsl(colors.text),
      "--primary": colorToHsl(colors.primary),
      "--secondary": colorToHsl(colors.secondary),
      "--accent": colorToHsl(colors.accent),
      "--input": colorToHsl(colors.border),
      "--card-foreground": colorToHsl(colors.text),
      "--primary-foreground": colorToHsl(colors.primaryText || "#ffffff"),
      "--secondary-foreground": colorToHsl(colors.text),
      "--accent-foreground": colorToHsl(colors.text),
      "--muted": colorToHsl(colors.surface),
      "--popover": colorToHsl(colors.card),
      "--popover-foreground": colorToHsl(colors.text),
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 98%",
      "--theme-border": colors.border,
    };

    // Apply all CSS variables at once using Object.entries
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Update theme class
    root.classList.remove("light", "dark");
    root.classList.add(isDarkMode ? "dark" : "light");

    // Save preferences
    localStorage.setItem("metal-theme", currentTheme);
  }, [currentTheme, isDarkMode, colors]);

  // Memoized callbacks to prevent unnecessary re-renders
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
    localStorage.setItem("theme-mode", isDarkMode ? "light" : "dark");
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    const themes = Object.keys(METAL_THEMES) as MetalTheme[];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setCurrentTheme(themes[nextIndex]);
  }, [currentTheme]);

  const setTheme = useCallback((theme: MetalTheme) => {
    if (theme === 'light-mode') {
      setIsDarkMode(false);
      localStorage.setItem("theme-mode", "light");
    } else {
      setIsDarkMode(true);
      localStorage.setItem("theme-mode", "dark");
    }
    setCurrentTheme(theme);
  }, []);

  const getColors = useCallback((): ThemeColors => {
    return colors;
  }, [colors]);

  const getGradient = useCallback((): string => {
    return themeConfig.gradient;
  }, [themeConfig.gradient]);

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => {
    // Ensure we have valid values
    const safeCurrentTheme = currentTheme && METAL_THEMES[currentTheme] ? currentTheme : "classic-metal";
    const safeColors = getThemeColors(safeCurrentTheme, isDarkMode);
    const safeThemeConfig = METAL_THEMES[safeCurrentTheme];
    
    // Removed debug logging
    
    return {
      currentTheme: safeCurrentTheme,
      isDarkMode,
      colors: {
        ...safeColors,
        primaryText: safeColors.primaryText || (safeColors.primary === "#c0c0c0" ? "#000000" : "#ffffff"),
      },
      theme: safeThemeConfig,
      setTheme,
      toggleDarkMode,
      toggleTheme,
      gradient: safeThemeConfig.gradient,
      getColors,
      getGradient,
    };
  }, [
    currentTheme,
    isDarkMode,
    colors,
    themeConfig,
    setTheme,
    toggleDarkMode,
    toggleTheme,
    getColors,
    getGradient,
  ]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    console.error('[useTheme] useTheme must be used within a ThemeProvider');
    
    // Provide fallback values to prevent crashes
    const fallbackContext = {
      currentTheme: "classic-metal" as MetalTheme,
      isDarkMode: true,
      colors: METAL_THEMES["classic-metal"].colors.dark,
      theme: METAL_THEMES["classic-metal"],
      setTheme: () => console.warn('[useTheme] setTheme called outside ThemeProvider'),
      toggleDarkMode: () => console.warn('[useTheme] toggleDarkMode called outside ThemeProvider'),
      toggleTheme: () => console.warn('[useTheme] toggleTheme called outside ThemeProvider'),
      gradient: METAL_THEMES["classic-metal"].gradient,
      getColors: () => METAL_THEMES["classic-metal"].colors.dark,
      getGradient: () => METAL_THEMES["classic-metal"].gradient,
    };
    
    return fallbackContext;
  }
  
  return context;
}