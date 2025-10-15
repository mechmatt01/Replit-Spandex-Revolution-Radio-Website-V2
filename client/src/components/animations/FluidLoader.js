import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from '../../contexts/ThemeContext';
const FluidLoader = ({ size = 'md', type = 'pulse', color }) => {
    const { colors } = useTheme();
    const loaderColor = color || colors.primary;
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };
    const PulseLoader = () => (_jsxs("div", { className: `relative ${sizeClasses[size]}`, children: [_jsx("div", { className: "absolute inset-0 rounded-full animate-ping", style: { backgroundColor: `${loaderColor}40` } }), _jsx("div", { className: "absolute inset-2 rounded-full animate-pulse", style: { backgroundColor: loaderColor } })] }));
    const WaveLoader = () => (_jsx("div", { className: "flex space-x-1", children: [0, 1, 2].map(i => (_jsx("div", { className: `${size === 'sm' ? 'w-1 h-4' : size === 'md' ? 'w-2 h-8' : 'w-3 h-12'} rounded-full animate-pulse`, style: {
                backgroundColor: loaderColor,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
            } }, i))) }));
    const SpinLoader = () => (_jsx("div", { className: `relative ${sizeClasses[size]}`, children: _jsx("div", { className: "absolute inset-0 rounded-full border-2 border-transparent animate-spin", style: {
                borderTopColor: loaderColor,
                borderRightColor: `${loaderColor}60`
            } }) }));
    const DotsLoader = () => (_jsx("div", { className: "flex space-x-2", children: [0, 1, 2].map(i => (_jsx("div", { className: `${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} rounded-full animate-bounce`, style: {
                backgroundColor: loaderColor,
                animationDelay: `${i * 0.1}s`
            } }, i))) }));
    const loaders = {
        pulse: PulseLoader,
        wave: WaveLoader,
        spin: SpinLoader,
        dots: DotsLoader
    };
    const LoaderComponent = loaders[type];
    return (_jsx("div", { className: "flex items-center justify-center p-4", children: _jsx(LoaderComponent, {}) }));
};
export default FluidLoader;
