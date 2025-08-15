import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from "../contexts/ThemeContext";
import FullWidthGlobeMap from "../components/FullWidthGlobeMap";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import { useRadio } from "../contexts/RadioContext";
import Navigation from "../components/Navigation";
export default function MapPage() {
    const { currentTheme, colors } = useTheme();
    const { isAuthenticated, user } = useFirebaseAuth();
    const radioContext = useRadio();
    return (_jsxs("div", { className: "min-h-screen transition-colors duration-300", style: {
            backgroundColor: colors.background,
            color: colors.text
        }, children: [_jsx("div", { id: "main-navigation", children: _jsx(Navigation, {}) }), _jsxs("main", { id: "main-content", className: "pt-16", children: [_jsx("section", { className: "py-20 transition-colors duration-300", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "text-center mb-12", children: [_jsx("h1", { className: "font-orbitron font-black text-3xl md:text-4xl mb-4", style: {
                                            color: currentTheme === 'light-mode' ? '#000000' : colors.text
                                        }, children: "LIVE INTERACTIVE MAP" }), _jsx("p", { className: "text-lg", style: { color: colors.textMuted }, children: "Explore our global community of metalheads and see where the music is playing live." })] }) }) }), _jsx("section", { className: "py-8", children: _jsx(FullWidthGlobeMap, {}) })] })] }));
}
