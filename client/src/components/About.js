import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "../components/ui/button";
import { useTheme } from "../contexts/ThemeContext";
import FadeInView from "./FadeInView";
import StaggeredAnimation from "./StaggeredAnimation";
export default function About() {
    const { getColors, currentTheme } = useTheme();
    const colors = getColors();
    const scrollToSubscribe = () => {
        const element = document.getElementById("subscribe");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };
    return (_jsx("section", { id: "about", className: "py-20 transition-colors duration-300", style: { backgroundColor: colors.background }, "aria-label": "About Spandex Salvation Radio", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex flex-col lg:flex-row gap-12 items-center", children: [_jsxs("div", { className: "lg:w-3/5", children: [_jsx("h2", { className: "font-orbitron font-black text-3xl md:text-4xl mb-6", style: {
                                    color: currentTheme === 'light-mode' ? '#000000' : colors.text
                                }, children: "ABOUT THE REBELLION" }), _jsx("p", { className: "text-lg font-semibold mb-6", style: { color: colors.textSecondary }, children: "Spandex Salvation Radio was born from a passion for the golden era of metal music. When hair was big, guitars were loud, and the stage was set ablaze with pure rock energy." }), _jsx("p", { className: "font-semibold mb-6", style: { color: colors.textMuted }, children: "We're dedicated to preserving and celebrating the legendary sounds of bands like Skid Row, Twisted Sister, M\u00F6tley Cr\u00FCe, and countless other metal pioneers who defined a generation." }), _jsxs(StaggeredAnimation, { className: "flex items-center space-x-6 mb-8", staggerDelay: 200, direction: "up", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-black text-center", style: { color: colors.primary }, children: "24/7" }), _jsx("div", { className: "text-sm font-semibold text-center", style: { color: colors.textMuted }, children: "Live Streaming" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-black text-center", style: { color: colors.primary }, children: "1000+" }), _jsx("div", { className: "text-sm font-semibold text-center", style: { color: colors.textMuted }, children: "Metal Tracks" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-black text-center", style: { color: colors.primary }, children: "50+" }), _jsx("div", { className: "text-sm font-semibold text-center", style: { color: colors.textMuted }, children: "Countries" })] })] }), _jsx(FadeInView, { direction: "up", delay: 600, children: _jsx(Button, { onClick: scrollToSubscribe, className: "px-6 py-3 rounded-full font-semibold transition-all duration-300", style: {
                                        backgroundColor: colors.primary,
                                        color: colors.primaryText || "white",
                                    }, onMouseEnter: (e) => {
                                        e.currentTarget.style.backgroundColor =
                                            colors.primaryDark || colors.primary;
                                        e.currentTarget.style.transform = "scale(1.05)";
                                    }, onMouseLeave: (e) => {
                                        e.currentTarget.style.backgroundColor = colors.primary;
                                        e.currentTarget.style.transform = "scale(1)";
                                    }, children: "Join the Revolution" }) })] }), _jsxs("div", { className: "relative hidden lg:block lg:w-2/5", children: [_jsx("img", { src: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600", alt: "Metal concert with band performing on stage under dramatic lighting", className: "rounded-xl shadow-2xl w-full h-auto" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-dark-bg/50 to-transparent rounded-xl" })] })] }) }) }));
}
