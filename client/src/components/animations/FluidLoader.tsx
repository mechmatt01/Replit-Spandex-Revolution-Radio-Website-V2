import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface FluidLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  type?: 'pulse' | 'wave' | 'spin' | 'dots';
  color?: string;
}

const FluidLoader: React.FC<FluidLoaderProps> = ({
  size = 'md',
  type = 'pulse',
  color
}) => {
  const { colors } = useTheme();
  const loaderColor = color || colors.primary;
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const PulseLoader = () => (
    <div className={`relative ${sizeClasses[size]}`}>
      <div 
        className="absolute inset-0 rounded-full animate-ping"
        style={{ backgroundColor: `${loaderColor}40` }}
      />
      <div 
        className="absolute inset-2 rounded-full animate-pulse"
        style={{ backgroundColor: loaderColor }}
      />
    </div>
  );

  const WaveLoader = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`${size === 'sm' ? 'w-1 h-4' : size === 'md' ? 'w-2 h-8' : 'w-3 h-12'} rounded-full animate-pulse`}
          style={{ 
            backgroundColor: loaderColor,
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );

  const SpinLoader = () => (
    <div className={`relative ${sizeClasses[size]}`}>
      <div
        className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
        style={{
          borderTopColor: loaderColor,
          borderRightColor: `${loaderColor}60`
        }}
      />
    </div>
  );

  const DotsLoader = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} rounded-full animate-bounce`}
          style={{
            backgroundColor: loaderColor,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );

  const loaders = {
    pulse: PulseLoader,
    wave: WaveLoader,
    spin: SpinLoader,
    dots: DotsLoader
  };

  const LoaderComponent = loaders[type];

  return (
    <div className="flex items-center justify-center p-4">
      <LoaderComponent />
    </div>
  );
};

export default FluidLoader;