import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type MetalTheme = 
  | "classic-metal" 
  | "black-metal" 
  | "death-metal" 
  | "power-metal" 
  | "doom-metal" 
  | "thrash-metal"
  | "gothic-metal";

interface ThemeColors {
  primary: string;
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
  }
};

interface ThemeContextType {
  currentTheme: MetalTheme;
  lightMode: boolean;
  setTheme: (theme: MetalTheme) => void;
  toggleLightMode: () => void;
  getColors: () => ThemeColors;
  getGradient: () => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<MetalTheme>("classic-metal");
  const [lightMode, setLightMode] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem("metal-theme") as MetalTheme;
    const savedLightMode = localStorage.getItem("light-mode") === "true";
    
    if (savedTheme && METAL_THEMES[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
    setLightMode(savedLightMode);
  }, []);

  useEffect(() => {
    // Apply theme colors to CSS variables
    const colors = METAL_THEMES[currentTheme].colors[lightMode ? "light" : "dark"];
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
    root.classList.add(lightMode ? "light" : "dark");
    
    // Save preferences
    localStorage.setItem("metal-theme", currentTheme);
    localStorage.setItem("light-mode", lightMode.toString());
    
    // Remove transition after animation
    setTimeout(() => {
      root.style.transition = "";
    }, 300);
  }, [currentTheme, lightMode]);

  const setTheme = (theme: MetalTheme) => {
    setCurrentTheme(theme);
  };

  const toggleLightMode = () => {
    setLightMode(prev => !prev);
  };

  const getColors = (): ThemeColors => {
    return METAL_THEMES[currentTheme].colors[lightMode ? "light" : "dark"];
  };

  const getGradient = (): string => {
    return METAL_THEMES[currentTheme].gradient;
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      lightMode,
      setTheme,
      toggleLightMode,
      getColors,
      getGradient
    }}>
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