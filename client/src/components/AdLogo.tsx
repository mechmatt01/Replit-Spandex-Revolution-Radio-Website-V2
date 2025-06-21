import { useTheme } from "@/contexts/ThemeContext";

interface AdLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AdLogo({ size = 'md', className = "" }: AdLogoProps) {
  const { getColors } = useTheme();
  const colors = getColors();
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-xl', 
    lg: 'w-24 h-24 text-2xl'
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${className} rounded-lg flex items-center justify-center font-black text-white shadow-lg`}
      style={{
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
      }}
    >
      Ad
    </div>
  );
}