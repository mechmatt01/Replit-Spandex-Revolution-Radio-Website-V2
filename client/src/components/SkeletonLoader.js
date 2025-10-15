import { jsx as _jsx } from "react/jsx-runtime";
import { useTheme } from "../contexts/ThemeContext";
export default function SkeletonLoader({ width = '100%', height = '20px', className = '', variant = 'rectangular', lines = 1 }) {
    const { isDarkMode } = useTheme();
    const baseClasses = `animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} ${className}`;
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
        return (_jsx("div", { className: `${baseClasses} rounded-full`, style: {
                width,
                height,
                ...shimmerEffect
            } }));
    }
    if (variant === 'text') {
        return (_jsx("div", { className: "space-y-2", children: Array.from({ length: lines || 0 }).map((_, index) => (_jsx("div", { className: `${baseClasses} rounded`, style: {
                    width: index === lines - 1 ? '75%' : '100%',
                    height: '16px',
                    ...shimmerEffect
                } }, index))) }));
    }
    return (_jsx("div", { className: `${baseClasses} rounded`, style: {
            width,
            height,
            ...shimmerEffect
        } }));
}
