import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
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
        accent: "#ffd23f",
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
        accent: "#f4a900",
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
        text: "#e0e0e0",
        textSecondary: "#b0b0b0",
        textMuted: "#808080",
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
        text: "#e0e0e0",
        textSecondary: "#b0b0b0",
        textMuted: "#808080",
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
        text: "#f0f8ff",
        textSecondary: "#ddeeff",
        textMuted: "#aabbcc",
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
        text: "#f0f8ff",
        textSecondary: "#ddeeff",
        textMuted: "#aabbcc",
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
        secondary: "#9c27b0",
        accent: "#e91e63",
        background: "#0a0a0a",
        surface: "#1a0a1a",
        text: "#fff9c4",
        textSecondary: "#f4ff81",
        textMuted: "#cccc00",
        border: "#4a148c",
        card: "#1a0a1a",
        cardBackground: "#1a0a1a",
      },
      light: {
        primary: "#f57f17",
        secondary: "#7b1fa2",
        accent: "#c2185b",
        background: "#0a0a0a",
        surface: "#1a0a1a",
        text: "#fff9c4",
        textSecondary: "#f4ff81",
        textMuted: "#cccc00",
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
        background: "#ffffff",
        surface: "#f8fafc",
        text: "#0f172a",
        textSecondary: "#475569",
        textMuted: "#94a3b8",
        border: "#e2e8f0",
        card: "#ffffff",
        cardBackground: "#ffffff",
      },
      light: {
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
        background:
          "linear-gradient(135deg, #8b0080 0%, #ff0080 25%, #ff6600 50%, #ffff00 75%, #ff0080 100%)",
        surface: "rgba(255, 255, 255, 0.08)",
        text: "#ffffff",
        textSecondary: "#e0e0e0",
        textMuted: "#cccccc",
        border: "rgba(255, 255, 255, 0.18)",
        card: "rgba(255, 255, 255, 0.08)",
        cardBackground: "rgba(255, 255, 255, 0.08)",
      },
      light: {
        primary: "#ff0080",
        primaryDark: "#e6006b",
        primaryText: "#ffffff",
        secondary: "#ff6600",
        accent: "#ffff00",
        background:
          "linear-gradient(135deg, #8b0080 0%, #ff0080 25%, #ff6600 50%, #ffff00 75%, #ff0080 100%)",
        surface: "rgba(255, 255, 255, 0.08)",
        text: "#ffffff",
        textSecondary: "#e0e0e0",
        textMuted: "#cccccc",
        border: "rgba(255, 255, 255, 0.18)",
        card: "rgba(255, 255, 255, 0.08)",
        cardBackground: "rgba(255, 255, 255, 0.08)",
      },
    },
    gradient:
      "linear-gradient(135deg, #8b0080 0%, #ff0080 25%, #ff6600 50%, #ffff00 75%, #ff0080 100%)",
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

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<MetalTheme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("metal-theme") as MetalTheme;
      return saved && saved in METAL_THEMES ? saved : "classic-metal";
    }
    return "classic-metal";
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme-mode");
      return saved !== "light";
    }
    return true;
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("theme-mode", newMode ? "dark" : "light");
      return newMode;
    });
  };

  const toggleTheme = () => {
    toggleDarkMode();
  };

  const getThemeColors = (
    themeName: MetalTheme,
    isDark: boolean,
  ): ThemeColors => {
    const theme = METAL_THEMES[themeName];
    return isDark ? theme.colors.dark : theme.colors.light;
  };

  const colors = getThemeColors(currentTheme, isDarkMode);

  useEffect(() => {
    const isLightMode = currentTheme === "light-mode";

    const root = document.documentElement;

    // Add fade out effect
    document.body.style.opacity = "0.7";
    document.body.style.transition = "opacity 0.15s ease-out";

    setTimeout(() => {
      // Add smooth transition
      root.style.transition = "all 0.3s ease";

      // Handle glassmorphism theme special background
      if (currentTheme === "glassmorphism-premium") {
        document.body.style.background = colors.background;
        document.body.style.backgroundSize = "400% 400%";
        document.body.style.animation = "glassmorphGradient 8s ease infinite";
        root.style.setProperty("--color-background", "transparent");

        // Add glassmorphism class for special styling
        root.classList.add("glassmorphism-theme");
      } else {
        document.body.style.background = "";
        document.body.style.backgroundSize = "";
        document.body.style.animation = "";
        root.classList.remove("glassmorphism-theme");
        root.style.setProperty("--color-background", colors.background);
      }

      // Set CSS custom properties
      root.style.setProperty("--color-primary", colors.primary);
      root.style.setProperty("--color-secondary", colors.secondary);
      root.style.setProperty("--color-accent", colors.accent);
      root.style.setProperty("--color-surface", colors.surface);
      root.style.setProperty("--color-text", colors.text);
      root.style.setProperty("--color-text-secondary", colors.textSecondary);
      root.style.setProperty("--color-border", colors.border);
      root.style.setProperty("--color-card", colors.card);
      root.style.setProperty(
        "--gradient-primary",
        METAL_THEMES[currentTheme].gradient,
      );

      // Apply theme class
      root.classList.remove("light", "dark");
      root.classList.add(isLightMode ? "light" : "dark");

      // Save preferences
      localStorage.setItem("metal-theme", currentTheme);

      // Fade back in
      setTimeout(() => {
        document.body.style.opacity = "1";
        document.body.style.transition = "opacity 0.15s ease-in";

        // Remove transition after animation
        setTimeout(() => {
          root.style.transition = "";
          document.body.style.transition = "";
        }, 150);
      }, 150);
    }, 150);
  }, [currentTheme, isDarkMode, colors]);

  const setTheme = (theme: MetalTheme) => {
    // For light-mode theme, also set isDarkMode to false
    if (theme === 'light-mode') {
      setIsDarkMode(false);
    } else if (theme !== 'light-mode') {
      setIsDarkMode(true);
    }
    
    setCurrentTheme(theme);
  };

  const getColors = (): ThemeColors => {
    return colors;
  };

  const getGradient = (): string => {
    return METAL_THEMES[currentTheme].gradient;
  };

  const value: ThemeContextType = {
    currentTheme,
    isDarkMode,
    colors: {
      ...colors,
      primaryText:
        colors.primaryText ||
        (colors.primary === "#c0c0c0" ? "#000000" : "#ffffff"),
    },
    theme: METAL_THEMES[currentTheme],
    setTheme,
    toggleDarkMode,
    toggleTheme,
    gradient: METAL_THEMES[currentTheme].gradient,
    getColors,
    getGradient,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
