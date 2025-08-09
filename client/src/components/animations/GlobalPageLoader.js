import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import FluidLoader from './FluidLoader';
const GlobalPageLoader = ({ isLoading, children }) => {
    const [showLoader, setShowLoader] = useState(isLoading);
    const [contentReady, setContentReady] = useState(!isLoading);
    const { colors } = useTheme();
    useEffect(() => {
        if (isLoading) {
            setShowLoader(true);
            setContentReady(false);
        }
        else {
            // Quick transition out of loading state
            setTimeout(() => {
                setContentReady(true);
                setTimeout(() => setShowLoader(false), 150);
            }, 200);
        }
    }, [isLoading]);
    if (showLoader) {
        return (_jsxs("div", { className: "fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-300", style: { backgroundColor: colors.background }, children: [_jsxs("div", { className: "mb-8 scale-110 opacity-90 transition-all duration-500", children: [_jsx("div", { className: "text-4xl font-black tracking-wider", style: { color: colors.primary }, children: "SPANDEX SALVATION" }), _jsx("div", { className: "text-lg font-semibold text-center mt-2 opacity-70", style: { color: colors.textSecondary }, children: "RADIO" })] }), _jsx(FluidLoader, { size: "lg", type: "pulse" }), _jsx("div", { className: "mt-6 text-sm font-medium opacity-60 animate-pulse", style: { color: colors.textSecondary }, children: "Loading the ultimate metal experience..." }), _jsx("div", { className: "mt-4 w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full rounded-full transition-all duration-1000 ease-out", style: {
                            width: contentReady ? '100%' : '60%',
                            backgroundColor: colors.primary,
                            transition: 'width 1s ease-out'
                        } }) })] }));
    }
    return (_jsx("div", { className: `transition-all duration-500 ease-out ${contentReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`, children: children }));
};
export default GlobalPageLoader;
