import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
const ImmersiveLoader = ({ isLoading, children, type = 'fade', delay = 0, duration = 300 }) => {
    const [hasLoaded, setHasLoaded] = useState(false);
    const { colors } = useTheme();
    useEffect(() => {
        if (!isLoading && !hasLoaded) {
            const timer = setTimeout(() => {
                setHasLoaded(true);
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [isLoading, hasLoaded, delay]);
    const getTransitionClasses = () => {
        const baseClasses = `transition-all duration-${duration} ease-out`;
        if (!hasLoaded || isLoading) {
            switch (type) {
                case 'slide':
                    return `${baseClasses} transform translate-y-4 opacity-0`;
                case 'scale':
                    return `${baseClasses} transform scale-95 opacity-0`;
                case 'blur':
                    return `${baseClasses} filter blur-sm opacity-0`;
                default:
                    return `${baseClasses} opacity-0`;
            }
        }
        return `${baseClasses} transform translate-y-0 scale-100 opacity-100 filter blur-none`;
    };
    const Skeleton = () => (_jsxs("div", { className: "animate-pulse space-y-4", children: [_jsx("div", { className: "h-6 rounded-lg", style: { backgroundColor: `${colors.surface}40` } }), _jsx("div", { className: "h-4 rounded-lg w-3/4", style: { backgroundColor: `${colors.surface}30` } }), _jsx("div", { className: "h-4 rounded-lg w-1/2", style: { backgroundColor: `${colors.surface}20` } })] }));
    return (_jsxs("div", { className: "relative", children: [isLoading && (_jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center", children: _jsx(Skeleton, {}) })), _jsx("div", { className: getTransitionClasses(), children: children })] }));
};
export default ImmersiveLoader;
