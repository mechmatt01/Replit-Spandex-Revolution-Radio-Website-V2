import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AnimatedVolumeIconProps {
  isMuted: boolean;
  volume: number;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  showWaves?: boolean;
}

export default function AnimatedVolumeIcon({
  isMuted,
  volume,
  size = 24,
  className = '',
  style = {},
  onClick,
  showWaves = false
}: AnimatedVolumeIconProps) {
  if (isMuted || volume === 0) {
    return (
      <VolumeX 
        size={size} 
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (!showWaves) {
    return (
      <Volume2 
        size={size} 
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  return (
    <div 
      className={`relative flex items-center justify-center transition-all duration-300 ease-in-out ${className}`}
      style={style}
      onClick={onClick}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="relative"
      >
        {/* Speaker icon - clean and centered */}
        <path
          d="M6 5L2 9H1v6h1l4 4V5z"
          fill="currentColor"
        />
        {/* Sound waves - smallest first, inner circles facing INWARDS towards speaker */}
        <path
          d="M12 6a3 3 0 0 1 0 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            animation: "volumeWave 1.5s ease-in-out infinite",
            animationDelay: "0s",
          }}
        />
        <path
          d="M16 4a5 5 0 0 1 0 16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            animation: "volumeWave 1.5s ease-in-out infinite",
            animationDelay: "0.3s",
          }}
        />
        <path
          d="M20 2a7 7 0 0 1 0 20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            animation: "volumeWave 1.5s ease-in-out infinite",
            animationDelay: "0.6s",
          }}
        />
      </svg>
    </div>
  );
}
