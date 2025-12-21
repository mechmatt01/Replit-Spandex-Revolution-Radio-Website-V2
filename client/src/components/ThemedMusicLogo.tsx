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
      className={`${sizeClasses[size]} rounded-md flex items-center justify-center relative ${className}`}
      style={{ 
        background: gradient,
        border: `3px solid ${colors.primary}`,
        borderRadius: '6px',
        boxShadow: `0 25px 50px -15px ${colors.primary}70, 0 12px 24px -6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)`,
        transform: 'perspective(1200px) rotateX(8deg) rotateY(-8deg)',
        transformStyle: 'preserve-3d',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Music icon directly in the main container - no nested inner box */}
      <Music 
        className={`${iconSizes[size]} text-white`}
        style={{
          filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
          transform: 'translateZ(10px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
    </div>
  );
}