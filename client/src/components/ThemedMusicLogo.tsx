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
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center shadow-2xl relative ${className}`}
      style={{ 
        background: gradient,
        border: `2px solid ${colors.primary}`,
        borderRadius: '50%',
        boxShadow: `0 20px 40px -12px ${colors.primary}60, 0 8px 16px -4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`
      }}
    >
      {/* Inner rounded box that pops out in the middle */}
      <div 
        className="absolute inset-3 rounded-full flex items-center justify-center"
        style={{ 
          background: `linear-gradient(135deg, ${colors.background}95, ${colors.background}80)`,
          border: `2px solid ${colors.primary}80`,
          borderRadius: '50%',
          boxShadow: `0 12px 24px -8px ${colors.primary}40, 0 4px 8px -2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)`
        }}
      >
        <Music 
          className={`${iconSizes[size]} text-white`}
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }}
        />
      </div>
    </div>
  );
}