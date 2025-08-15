import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from "../contexts/ThemeContext";
import FadeInView from "../components/FadeInView";
export default function FeaturesPage() {
    const { getColors, currentTheme } = useTheme();
    const colors = getColors();
    return (_jsx("div", { className: "min-h-screen transition-colors duration-300", style: {
            backgroundColor: colors.background,
            color: colors.text
        }, children: _jsx("main", { id: "main-content", children: _jsx(FadeInView, { direction: "up", delay: 0, children: _jsx("section", { id: "features", className: "py-20 transition-colors duration-300", style: { backgroundColor: colors.background }, children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h1", { className: "font-orbitron font-black text-4xl md:text-5xl mb-4", style: {
                                            color: currentTheme === 'light-mode' ? '#000000' : colors.text
                                        }, children: "Features" }), _jsx("p", { className: "text-lg font-semibold", style: {
                                            color: currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.7)' : colors.textMuted
                                        }, children: "Explore our premium features and subscription tiers." })] }), _jsx("div", { className: "text-center", children: _jsx("p", { className: "text-lg", style: { color: colors.textMuted }, children: "Features content will be displayed here." }) })] }) }) }) }) }));
}
