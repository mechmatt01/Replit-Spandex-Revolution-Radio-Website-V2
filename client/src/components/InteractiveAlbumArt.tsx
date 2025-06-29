import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ThemedMusicLogo from '@/components/ThemedMusicLogo';
import AdLogo from '@/components/AdLogo';

interface InteractiveAlbumArtProps {
  artwork?: string;
  title: string;
  artist: string;
  isPlaying?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function InteractiveAlbumArt({ 
  artwork, 
  title, 
  artist, 
  isPlaying = false,
  size = 'md', 
  className = '' 
}: InteractiveAlbumArtProps) {
  const { getGradient, currentTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [previousGradient, setPreviousGradient] = useState(getGradient());
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10 sm:w-12 sm:h-12',
    md: 'w-24 h-24 sm:w-32 sm:h-32',
    lg: 'w-32 h-32 sm:w-48 sm:h-48'
  };

  const logoSizes = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const
  };

  // Handle theme changes with gradient morphing
  useEffect(() => {
    const currentGradient = getGradient();
    if (currentGradient !== previousGradient && !artwork) {
      setIsTransitioning(true);
      
      // Create smooth gradient transition effect
      const timer = setTimeout(() => {
        setPreviousGradient(currentGradient);
        setIsTransitioning(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [currentTheme, getGradient, previousGradient, artwork]);

  // Simplified gradient transition without canvas
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageLoaded(false);
  };

  return (
    <div 
      className={`relative ${sizeClasses[size]} rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isHovered 
          ? `0 20px 40px -12px ${getGradient()}40` 
          : '0 4px 8px rgba(0,0,0,0.2)'
      }}
    >


      {/* Themed Placeholder Background */}
      <div 
        className="absolute inset-0 flex items-center justify-center transition-all duration-500"
        style={{ 
          background: getGradient(),
          opacity: (!artwork || artwork === "" || !imageLoaded || artwork === "advertisement") ? 1 : 0,
          transform: isHovered ? 'scale(1.1)' : 'scale(1)'
        }}
      >
        <div className="transition-transform duration-300" style={{ transform: isHovered ? 'rotate(5deg)' : 'rotate(0deg)' }}>
          {(artwork === "advertisement" || 
            title.toLowerCase().includes("commercial") ||
            title.toLowerCase().includes("advertisement") ||
            title.toLowerCase().includes("commercial break")) ? (
            <div className="text-white font-black text-xl bg-red-600 px-3 py-1 rounded">AD</div>
          ) : (
            <ThemedMusicLogo size={logoSizes[size]} />
          )}
        </div>
        

      </div>
      
      {/* Album Artwork */}
      {artwork && artwork.trim() && artwork !== "advertisement" && (
        <div 
          className="absolute inset-0 transition-all duration-500"
          style={{ 
            opacity: imageLoaded ? 1 : 0,
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
        >
          <img 
            src={artwork} 
            alt={`${title} by ${artist}`}
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          {/* Gradient overlay on hover */}
          <div 
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: `linear-gradient(45deg, ${getGradient()}20, transparent)`,
              opacity: isHovered ? 1 : 0
            }}
          />
          
          {/* Reflection effect */}
          {isHovered && (
            <div 
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                opacity: 0.6
              }}
            />
          )}
        </div>
      )}

      {/* Interactive border glow */}
      <div 
        className="absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none"
        style={{
          border: isHovered ? `2px solid ${getGradient()}80` : '2px solid transparent',
          boxShadow: isHovered 
            ? `inset 0 0 20px ${getGradient()}20` 
            : 'none'
        }}
      />

      {/* Loading shimmer effect */}
      {artwork && !imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      )}
    </div>
  );
}