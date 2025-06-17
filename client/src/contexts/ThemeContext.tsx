import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
      setTheme(savedTheme);
    } else {
      setTheme("dark"); // Default to dark theme
    }
  }, []);

  useEffect(() => {
    // Apply theme to document element with fade animation
    const root = document.documentElement;
    
    // Add transition class for smooth animation
    root.style.transition = "background-color 0.3s ease, color 0.3s ease";
    
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
    
    // Save theme preference
    localStorage.setItem("theme", theme);
    
    // Remove transition after animation completes
    setTimeout(() => {
      root.style.transition = "";
    }, 300);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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