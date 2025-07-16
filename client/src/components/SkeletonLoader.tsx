import { useTheme } from "@/contexts/ThemeContext";

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  lines?: number;
}

export default function SkeletonLoader({
  width = '100%',
  height = '20px',
  className = '',
  variant = 'rectangular',
  lines = 1
}: SkeletonLoaderProps) {
  const { isDarkMode } = useTheme();

  const baseClasses = `animate-pulse ${
    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
  } ${className}`;

  const shimmerEffect = {
    background: `linear-gradient(
      90deg,
      ${isDarkMode ? '#374151' : '#e5e7eb'} 25%,
      ${isDarkMode ? '#4b5563' : '#f3f4f6'} 50%,
      ${isDarkMode ? '#374151' : '#e5e7eb'} 75%
    )`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite'
  };

  if (variant === 'circular') {
    return (
      <div
        className={`${baseClasses} rounded-full`}
        style={{
          width,
          height,
          ...shimmerEffect
        }}
      />
    );
  }

  if (variant === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} rounded`}
            style={{
              width: index === lines - 1 ? '75%' : '100%',
              height: '16px',
              ...shimmerEffect
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} rounded`}
      style={{
        width,
        height,
        ...shimmerEffect
      }}
    />
  );
}