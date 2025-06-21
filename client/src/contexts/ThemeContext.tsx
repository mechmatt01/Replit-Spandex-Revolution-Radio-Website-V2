import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type MetalTheme = 
  | "classic-metal" 
  | "black-metal" 
  | "death-metal" 
  | "power-metal" 
  | "doom-metal" 
  | "thrash-metal"
  | "gothic-metal"
  | "light-mode"
  | "dark-mode";

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
  border: string;
}

interface MetalThemeConfig {
  name: string;
  description: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  gradient: string;
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
        border: "#333333"
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
        border: "#e0e0e0"
      }
    },
    gradient: "linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)"
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
        border: "#333333"
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
        border: "#cccccc"
      }
    },
    gradient: "linear-gradient(135deg, #c0c0c0 0%, #8b8b8b 100%)"
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
        border: "#4d1414"
      },
      light: {
        primary: "#c62828",
        secondary: "#d32f2f",
        accent: "#f44336",
        background: "#fff5f5",
        surface: "#ffebee",
        text: "#1a0000",
        textSecondary: "#5d0000",
        border: "#ffcdd2"
      }
    },
    gradient: "linear-gradient(135deg, #dc143c 0%, #b71c1c 100%)"
  },
  "power-metal": {
    name: "Power Metal",
    description: "Epic gold and blue fantasy theme",
    colors: {
      dark: {
        primary: "#ffd700",
        secondary: "#4169e1",
        accent: "#87ceeb",
        background: "#0a0a1a",
        surface: "#1a1a2e",
        text: "#f0f8ff",
        textSecondary: "#ddeeff",
        border: "#2a2a5a"
      },
      light: {
        primary: "#ffb300",
        secondary: "#1976d2",
        accent: "#2196f3",
        background: "#f8f9ff",
        surface: "#e3f2fd",
        text: "#0d1421",
        textSecondary: "#1a237e",
        border: "#bbdefb"
      }
    },
    gradient: "linear-gradient(135deg, #ffd700 0%, #4169e1 100%)"
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
        border: "#3e2723"
      },
      light: {
        primary: "#6d4c41",
        secondary: "#388e3c",
        accent: "#ff9800",
        background: "#fafafa",
        surface: "#f1f8e9",
        text: "#2e2e2e",
        textSecondary: "#4e342e",
        border: "#c8e6c9"
      }
    },
    gradient: "linear-gradient(135deg, #8b4513 0%, #2e7d32 100%)"
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
        border: "#4a148c"
      },
      light: {
        primary: "#f57f17",
        secondary: "#7b1fa2",
        accent: "#c2185b",
        background: "#fffde7",
        surface: "#f3e5f5",
        text: "#1a1a00",
        textSecondary: "#4a0072",
        border: "#e1bee7"
      }
    },
    gradient: "linear-gradient(135deg, #ffeb3b 0%, #9c27b0 100%)"
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
        border: "#4a148c"
      },
      light: {
        primary: "#7b1fa2",
        secondary: "#c2185b",
        accent: "#e91e63",
        background: "#fce4ec",
        surface: "#f3e5f5",
        text: "#1a0014",
        textSecondary: "#4a0e4e",
        border: "#f8bbd9"
      }
    },
    gradient: "linear-gradient(135deg, #9c27b0 0%, #ad1457 100%)"
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
        border: "#e2e8f0"
      },
      light: {
        primary: "#2563eb",
        secondary: "#3b82f6",
        accent: "#60a5fa",
        background: "#ffffff",
        surface: "#f8fafc",
        text: "#0f172a",
        textSecondary: "#475569",
        border: "#e2e8f0"
      }
    },
    gradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)"
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
        border: "#334155"
      },
      light: {
        primary: "#60a5fa",
        secondary: "#3b82f6",
        accent: "#93c5fd",
        background: "#0f172a",
        surface: "#1e293b",
        text: "#f1f5f9",
        textSecondary: "#cbd5e1",
        border: "#334155"
      }
    },
    gradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)"
  }
};

interface ThemeContextType {
  currentTheme: MetalTheme;
  isDarkMode: boolean;
  colors: ThemeColors;
  setTheme: (theme: MetalTheme) => void;
  toggleDarkMode: () => void;
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
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem("theme-mode", newMode ? "dark" : "light");
      return newMode;
    });
  };

  const getThemeColors = (themeName: MetalTheme, isDark: boolean): ThemeColors => {
    const theme = METAL_THEMES[themeName];
    return isDark ? theme.colors.dark : theme.colors.light;
  };

  const colors = getThemeColors(currentTheme, isDarkMode);

  useEffect(() => {
    const isLightMode = currentTheme === "light-mode";
    
    const root = document.documentElement;
    
    // Add smooth transition
    root.style.transition = "all 0.3s ease";
    
    // Set CSS custom properties
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--gradient-primary', METAL_THEMES[currentTheme].gradient);
    
    // Apply theme class
    root.classList.remove("light", "dark");
    root.classList.add(isLightMode ? "light" : "dark");
    
    // Save preferences
    localStorage.setItem("metal-theme", currentTheme);
    
    // Remove transition after animation
    setTimeout(() => {
      root.style.transition = "";
    }, 300);
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
      primaryText: colors.primaryText || (colors.primary === "#c0c0c0" ? "#000000" : "#ffffff")
    },
    setTheme,
    toggleDarkMode,
    gradient: METAL_THEMES[currentTheme].gradient,
    getColors,
    getGradient
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}