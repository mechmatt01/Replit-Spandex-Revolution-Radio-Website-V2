import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ThemedMusicLogo from '@/components/ThemedMusicLogo';

interface InteractiveAlbumArtProps {
  artwork?: string;
  title: string;
  artist: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function InteractiveAlbumArt({ 
  artwork, 
  title, 
  artist, 
  size = 'md', 
  className = '' 
}: InteractiveAlbumArtProps) {
  const { getGradient, currentTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [previousGradient, setPreviousGradient] = useState(getGradient());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
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

  // Canvas-based gradient morphing animation
  useEffect(() => {
    if (!canvasRef.current || !isTransitioning) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let progress = 0;

    const animate = () => {
      progress += 0.05;
      
      if (progress >= 1) {
        progress = 1;
        setIsTransitioning(false);
      }

      // Create morphing gradient effect
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      
      // Interpolate between old and new gradients
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
      
      gradient.addColorStop(0, previousGradient);
      gradient.addColorStop(easeProgress, getGradient());
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isTransitioning, previousGradient, getGradient]);

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
      {/* Canvas for gradient morphing */}
      {isTransitioning && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          width={200}
          height={200}
        />
      )}

      {/* Themed Placeholder Background */}
      <div 
        className="absolute inset-0 flex items-center justify-center transition-all duration-500"
        style={{ 
          background: getGradient(),
          opacity: artwork && imageLoaded ? 0 : 1,
          transform: isHovered ? 'scale(1.1)' : 'scale(1)'
        }}
      >
        <div className="transition-transform duration-300" style={{ transform: isHovered ? 'rotate(5deg)' : 'rotate(0deg)' }}>
          <ThemedMusicLogo size={logoSizes[size]} />
        </div>
        
        {/* Animated overlay particles */}
        {isHovered && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
                style={{
                  left: `${20 + (i * 10)}%`,
                  top: `${15 + (i * 8)}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Album Artwork */}
      {artwork && (
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