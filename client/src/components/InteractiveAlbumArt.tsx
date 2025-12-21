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
    
    // Only search for fallback if we haven't already
    if (!fallbackArtwork && !isSearchingFallback) {
      setIsSearchingFallback(true);
      try {
        const fallback = await (artworkFallbackService as any).searchArtwork(title, artist);
        if (fallback) {
          setFallbackArtwork(fallback);
        }
      } catch (error) {
        console.warn('Failed to fetch fallback artwork:', error);
      } finally {
        setIsSearchingFallback(false);
      }
    }
  };

  // Determine if we should show the default themed artwork
  const shouldShowDefaultArtwork = !artwork || 
    artwork === "" || 
    artwork === "advertisement" ||
    artwork === "default" ||
    (artwork && !imageLoaded && !fallbackArtwork);

  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-md overflow-hidden cursor-pointer transition-all duration-300 ${className}`}
      style={{
        transform: isHovered ? "scale(1.05) perspective(1000px) rotateX(5deg) rotateY(-5deg)" : "scale(1) perspective(1000px) rotateX(2deg) rotateY(-2deg)",
        boxShadow: noShadow ? "none" : isHovered
          ? `0 25px 50px -15px ${getGradient()}50, 0 12px 24px -6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)`
          : `0 15px 30px -10px ${getGradient()}30, 0 8px 16px -4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
        borderRadius: '6px',
        transformStyle: 'preserve-3d',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Themed Placeholder Background - Always show when no valid artwork */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-all duration-500"
        style={{
          background: isAd 
            ? "linear-gradient(45deg, #ff4444, #cc0000)" 
            : getGradient(),
          opacity: shouldShowDefaultArtwork ? 1 : 0,
          transform: isHovered ? "scale(1.1) translateZ(5px)" : "scale(1) translateZ(0px)",
          borderRadius: '6px',
          transformStyle: 'preserve-3d',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
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

      {/* Album Artwork with Verification - Only show when we have valid artwork */}
      {(artwork && artwork.trim() && artwork !== "advertisement" && artwork !== "default") || fallbackArtwork ? (
        <div
          className="absolute inset-0 transition-all duration-500"
          style={{
            opacity: imageLoaded ? 1 : 0,
            borderRadius: '6px',
            transform: isHovered ? "translateZ(5px)" : "translateZ(0px)",
            transformStyle: 'preserve-3d',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <img
            src={fallbackArtwork || artwork}
            alt={`${title} by ${artist}`}
            className="w-full h-full object-cover"
            style={{
              borderRadius: '6px',
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        </div>
      ) : null}
    </div>
  );
}
