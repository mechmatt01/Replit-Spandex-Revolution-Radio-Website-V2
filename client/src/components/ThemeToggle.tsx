import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-dark-surface/80 dark:bg-dark-surface/80 light:bg-white/80 border border-dark-border dark:border-dark-border light:border-gray-300 backdrop-blur-sm hover:bg-dark-surface dark:hover:bg-dark-surface light:hover:bg-gray-100 transition-all duration-300"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute inset-0 w-5 h-5 text-metal-orange transition-all duration-300 transform ${
            theme === "dark" 
              ? "rotate-90 scale-0 opacity-0" 
              : "rotate-0 scale-100 opacity-100"
          }`} 
        />
        <Moon 
          className={`absolute inset-0 w-5 h-5 text-metal-orange transition-all duration-300 transform ${
            theme === "dark" 
              ? "rotate-0 scale-100 opacity-100" 
              : "rotate-90 scale-0 opacity-0"
          }`} 
        />
      </div>
    </Button>
  );
}