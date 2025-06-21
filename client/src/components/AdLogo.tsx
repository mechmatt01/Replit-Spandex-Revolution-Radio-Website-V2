import { useTheme } from "@/contexts/ThemeContext";

interface AdLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AdLogo({ size = 'md', className = "" }: AdLogoProps) {
  const { getColors } = useTheme();
  const colors = getColors();
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl', 
    lg: 'text-2xl'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} font-black text-white`}>
      Ad
    </div>
  );
}