import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import ThemedMusicLogo from "../components/ThemedMusicLogo";
import { artworkFallbackService } from "../lib/artworkFallback";

interface InteractiveAlbumArtProps {
  artwork?: string;
  title: string;
  artist: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  isAd?: boolean;
  noShadow?: boolean; // Add this prop
}

export default function InteractiveAlbumArt({
  artwork,
  title,
  artist,
  size = "md",
  className = "",
  isAd = false,
  noShadow = false,
}: InteractiveAlbumArtProps) {
  const { getGradient, getColors, currentTheme } = useTheme();
  const colors = getColors();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [previousGradient, setPreviousGradient] = useState(getGradient());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fallbackArtwork, setFallbackArtwork] = useState<string | null>(null);
  const [isSearchingFallback, setIsSearchingFallback] = useState(false);

  const sizeClasses = {
    sm: "w-10 h-10 sm:w-12 sm:h-12",
    md: "w-24 h-24 sm:w-32 sm:h-32",
    lg: "w-32 h-32 sm:w-48 sm:h-48",
  };

  const logoSizes = {
    sm: "sm" as const,
    md: "md" as const,
    lg: "lg" as const,
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

  const handleImageError = async () => {
    setImageLoaded(false);
    console.warn(`Failed to load artwork for "${title}" by ${artist}. Searching for fallback...`);
    
    if (!isSearchingFallback) {
      setIsSearchingFallback(true);
      try {
        const fallback = await artworkFallbackService.getArtworkWithFallback(artwork, title, artist);
        if (fallback && fallback !== artwork) {
          setFallbackArtwork(fallback);
          console.log(`Found fallback artwork for "${title}" by ${artist}`);
        }
      } catch (error) {
        console.warn('Fallback artwork search failed:', error);
      } finally {
        setIsSearchingFallback(false);
      }
    }
  };

  return (
    <div
      className={`relative ${sizeClasses[size]} overflow-hidden ${noShadow ? '' : 'shadow-lg'} cursor-pointer transition-all duration-300 ${className}`}
      style={{
        borderRadius: size === 'sm' ? '12px' : '20px',
        transform: isHovered ? "scale(1.05)" : "scale(1)",
        boxShadow: isHovered && !noShadow
          ? `0 20px 40px -12px ${getGradient()}40`
          : noShadow ? "none" : "0 4px 8px rgba(0,0,0,0.2)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Themed Placeholder Background */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-all duration-500"
        style={{
          background: isAd 
            ? "linear-gradient(45deg, #ff4444, #cc0000)" 
            : getGradient(),
          opacity:
            !artwork ||
            artwork === "" ||
            !imageLoaded ||
            artwork === "advertisement"
              ? 1
              : 0,
          transform: isHovered ? "scale(1.1)" : "scale(1)",
        }}
      >
        {isAd ? (
          <div className="text-center text-white">
            <div className="text-2xl mb-1">📢</div>
            <div className="text-xs font-bold">AD</div>
            <div className="text-xs opacity-80">ADVERTISEMENT</div>
          </div>
        ) : (
          <ThemedMusicLogo size={logoSizes[size]} />
        )}
      </div>

      {/* Album Artwork with Verification */}
      {((artwork && artwork.trim() && artwork !== "advertisement") || fallbackArtwork) && (
        <div
          className="absolute inset-0 transition-all duration-500"
          style={{
            opacity: imageLoaded ? 1 : 0,
            transform: isHovered ? "scale(1.05)" : "scale(1)",
          }}
        >
          <img
            src={fallbackArtwork || artwork}
            alt={`${title} by ${artist}`}
            className="w-full h-full object-cover"
            style={{ borderRadius: '20px' }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />

          {/* Gradient overlay on hover */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: `linear-gradient(45deg, ${getGradient()}20, transparent)`,
              opacity: isHovered ? 1 : 0,
            }}
          />

          {/* Reflection effect */}
          {isHovered && (
            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
                opacity: 0.6,
              }}
            />
          )}
        </div>
      )}

      {/* Interactive border glow - REMOVED */}
      {/* <div
        className="absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none"
        style={{
          border: isHovered
            ? `2px solid ${colors.primary}80`
            : "2px solid transparent",
          boxShadow: isHovered ? `inset 0 0 10px ${colors.primary}20` : "none",
        }}
      /> */}

      {/* Loading shimmer effect */}
      {artwork && !imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      )}
    </div>
  );
}
