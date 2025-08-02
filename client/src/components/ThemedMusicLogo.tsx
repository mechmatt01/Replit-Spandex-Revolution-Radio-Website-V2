import { Music } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface ThemedMusicLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ThemedMusicLogo({ size = "md", className = "" }: ThemedMusicLogoProps) {
  const { getColors, getGradient } = useTheme();
  const colors = getColors();
  const gradient = getGradient();

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16", 
    lg: "w-24 h-24"
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-xl flex items-center justify-center shadow-lg ${className}`}
      style={{ 
        background: gradient,
        border: `2px solid ${colors.primary}`
      }}
    >
      <Music 
        className={`${iconSizes[size]} text-white`}
      />
    </div>
  );
}