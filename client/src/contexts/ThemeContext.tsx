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
  textMuted?: string;
  border: string;
  card?: string;
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
        textMuted: "#888888",
        border: "#333333",
        card: "#1a1a1a",
      },
      light: {
        primary: "#d4510a",
        primaryDark: "#b8450a",
        primaryText: "#ffffff",
        secondary: "#e8630e",
        accent: "#f4a900",
        background: "#ffffff",
        surface: "#f5f5f5",
        text: "#000000",
        textSecondary: "#666666",
        textMuted: "#999999",
        border: "#e0e0e0",
        card: "#f5f5f5",
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
      },
      light: {
        primary: "#666666",
        primaryDark: "#555555",
        primaryText: "#ffffff", // White text on dark background
        secondary: "#888888",
        accent: "#333333",
        background: "#f8f8f8",
        surface: "#eeeeee",
        text: "#1a1a1a",
        textSecondary: "#555555",
        textMuted: "#999999",
        border: "#cccccc",
        card: "#eeeeee",
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
      },
      light: {
        primary: "#c62828",
        secondary: "#d32f2f",
        accent: "#f44336",
        background: "#fff5f5",
        surface: "#ffebee",
        text: "#1a0000",
        textSecondary: "#5d0000",
        textMuted: "#aa0000",
        border: "#ffcdd2",
        card: "#ffebee",
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
        border: "#2a2a5a",
        textMuted: "#aabbcc",
        card: "#1a1a2e",
      },
      light: {
        primary: "#ffb300",
        primaryText: "#000000", // Black text on yellow background
        secondary: "#1976d2",
        accent: "#2196f3",
        background: "#f8f9ff",
        surface: "#e3f2fd",
        text: "#0d1421",
        textSecondary: "#1a237e",
        border: "#bbdefb",
        textMuted: "#5a86b3",
        card: "#e3f2fd",
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
        border: "#3e2723",
        textMuted: "#b8860b",
        card: "#1a1a0a",
      },
      light: {
        primary: "#6d4c41",
        secondary: "#388e3c",
        accent: "#ff9800",
        background: "#fafafa",
        surface: "#f1f8e9",
        text: "#2e2e2e",
        textSecondary: "#4e342e",
        border: "#c8e6c9",
        textMuted: "#795548",
        card: "#f1f8e9",
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
        border: "#4a148c",
        textMuted: "#cddc39",
        card: "#1a0a1a",
      },
      light: {
        primary: "#f57f17",
        secondary: "#7b1fa2",
        accent: "#c2185b",
        background: "#fffde7",
        surface: "#f3e5f5",
        text: "#1a1a00",
        textSecondary: "#4a0072",
        border: "#e1bee7",
        textMuted: "#880e4f",
        card: "#f3e5f5",
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
        border: "#4a148c",
        textMuted: "#ce93d8",
        card: "#1a0a1a",
      },
      light: {
        primary: "#7b1fa2",
        secondary: "#c2185b",
        accent: "#e91e63",
        background: "#fce4ec",
        surface: "#f3e5f5",
        text: "#1a0014",
        textSecondary: "#4a0e4e",
        border: "#f8bbd9",
        textMuted: "#880e4f",
        card: "#f3e5f5",
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
        border: "#e2e8f0",
        textMuted: "#64748b",
        card: "#f8fafc",
      },
      light: {
        primary: "#2563eb",
        secondary: "#3b82f6",
        accent: "#60a5fa",
        background: "#ffffff",
        surface: "#f8fafc",
        text: "#0f172a",
        textSecondary: "#475569",
        border: "#e2e8f0",
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
        border: "#334155",
        textMuted: "#94a3b8",
        card: "#1e293b",
      },
      light: {
        primary: "#60a5fa",
        secondary: "#3b82f6",
        accent: "#93c5fd",
        background: "#0f172a",
        surface: "#1e293b",
        text: "#f1f5f9",
        textSecondary: "#cbd5e1",
        border: "#334155",
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
        border: "rgba(255, 255, 255, 0.18)",
        textMuted: "#b0b0b0",
        card: "rgba(255, 255, 255, 0.08)",
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
        border: "rgba(255, 255, 255, 0.18)",
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

      // Helper function to convert hex to HSL
      const hexToHsl = (hex: string): string => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return "0 0% 0%";
        
        const r = parseInt(result[1], 16) / 255;
        const g = parseInt(result[2], 16) / 255;
        const b = parseInt(result[3], 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h: number, s: number, l: number = (max + min) / 2;
        
        if (max === min) {
          h = s = 0;
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            default: h = 0;
          }
          h /= 6;
        }
        
        h = Math.round(h * 360);
        s = Math.round(s * 100);
        l = Math.round(l * 100);
        
        return `${h} ${s}% ${l}%`;
      };

      // Set CSS custom properties for old system
      root.style.setProperty("--color-primary", colors.primary);
      root.style.setProperty("--color-secondary", colors.secondary);
      root.style.setProperty("--color-accent", colors.accent);
      root.style.setProperty("--color-surface", colors.surface);
      root.style.setProperty("--color-text", colors.text);
      root.style.setProperty("--color-text-secondary", colors.textSecondary);
      root.style.setProperty("--color-border", colors.border);
      root.style.setProperty(
        "--gradient-primary",
        METAL_THEMES[currentTheme].gradient,
      );

      // Set CSS custom properties for new Tailwind system (HSL values)
      root.style.setProperty("--background", hexToHsl(colors.background));
      root.style.setProperty("--foreground", hexToHsl(colors.text));
      root.style.setProperty("--card", hexToHsl(colors.card || colors.surface));
      root.style.setProperty("--card-foreground", hexToHsl(colors.text));
      root.style.setProperty("--popover", hexToHsl(colors.surface));
      root.style.setProperty("--popover-foreground", hexToHsl(colors.text));
      root.style.setProperty("--primary", hexToHsl(colors.primary));
      root.style.setProperty("--primary-foreground", hexToHsl(colors.primaryText || "#ffffff"));
      root.style.setProperty("--secondary", hexToHsl(colors.secondary));
      root.style.setProperty("--secondary-foreground", hexToHsl(colors.text));
      root.style.setProperty("--muted", hexToHsl(colors.surface));
      root.style.setProperty("--muted-foreground", hexToHsl(colors.textMuted || colors.textSecondary));
      root.style.setProperty("--accent", hexToHsl(colors.accent));
      root.style.setProperty("--accent-foreground", hexToHsl(colors.text));
      root.style.setProperty("--destructive", "0 84.2% 60.2%");
      root.style.setProperty("--destructive-foreground", hexToHsl(colors.text));
      root.style.setProperty("--border", hexToHsl(colors.border));
      root.style.setProperty("--input", hexToHsl(colors.border));
      root.style.setProperty("--ring", hexToHsl(colors.primary));

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
