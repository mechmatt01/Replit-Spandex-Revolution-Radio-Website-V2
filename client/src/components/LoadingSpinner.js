import { jsx as _jsx } from "react/jsx-runtime";
import { useTheme } from "../contexts/ThemeContext";
export default function LoadingSpinner({ size = 'md', className = '' }) {
    const { colors } = useTheme();
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };
    return (_jsx("div", { className: `${sizeClasses[size]} ${className}`, children: _jsx("div", { className: "animate-spin rounded-full border-2 border-transparent", style: {
                borderTopColor: colors.primary,
                borderRightColor: colors.primary,
                borderBottomColor: `${colors.primary}40`,
                borderLeftColor: `${colors.primary}40`,
                animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite'
            } }) }));
}
