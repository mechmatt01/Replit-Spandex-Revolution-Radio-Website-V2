import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Radio, Globe, Archive, Music, Crown, Shirt } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../contexts/ThemeContext";
import StaggeredAnimation from "./StaggeredAnimation";
import { useState } from "react";
export default function Features() {
    const { data: stats } = useQuery({
        queryKey: ["/api/stream-stats"],
    });
    const { getColors, isDarkMode, currentTheme } = useTheme();
    const colors = getColors();
    const [hoveredFeature, setHoveredFeature] = useState(null);
    // Use primary color for borders to ensure theme consistency
    const borderColor = colors.primary;
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };
    // Scroll to radio player at top of page
    const scrollToRadioPlayer = () => {
        const heroSection = document.getElementById("home");
        if (heroSection) {
            const radioPlayer = heroSection.querySelector('[role="region"][aria-label="Radio player controls"]');
            if (radioPlayer) {
                radioPlayer.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            else {
                heroSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    };
    return (_jsx("section", { id: "features", className: "py-20 transition-colors duration-300", style: { backgroundColor: colors.background }, "aria-label": "Platform features", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h2", { className: "font-orbitron font-black text-4xl md:text-5xl mb-6", style: {
                                color: currentTheme === 'light-mode' ? '#000000' : colors.text
                            }, children: "ROCK THE AIRWAVES" }), _jsx("p", { className: "text-xl font-semibold max-w-2xl mx-auto", style: { color: colors.textMuted }, children: "Experience the ultimate old-school metal radio experience with live streaming, interactive features, and exclusive content." })] }), _jsxs(StaggeredAnimation, { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", staggerDelay: 50, direction: "up", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-2 rounded-2xl overflow-hidden", children: _jsx("div", { className: "absolute inset-0 blur-xl opacity-0 transition-opacity duration-300", style: {
                                            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})`,
                                            opacity: hoveredFeature === 'streaming' ? 0.3 : 0,
                                        } }) }), _jsx(Card, { className: "relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 p-8 flex flex-col h-full enhanced-glow feature-container shadow-none", style: {
                                        backgroundColor: colors.background,
                                        borderColor: colors.primary,
                                        borderWidth: '2px',
                                        borderStyle: 'solid',
                                        transform: hoveredFeature === 'streaming' ? 'scale(1.05)' : 'scale(1)',
                                        boxShadow: 'none'
                                    }, onClick: scrollToRadioPlayer, onMouseEnter: () => setHoveredFeature('streaming'), onMouseLeave: () => setHoveredFeature(null), children: _jsxs(CardContent, { className: "p-0 flex flex-col h-full", children: [_jsx("div", { className: "w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg", style: { backgroundColor: colors.primary }, children: _jsx(Radio, { className: "text-white h-8 w-8" }) }), _jsx("h3", { className: "font-black text-2xl mb-4 h-16 flex items-center text-left", style: { color: colors.text }, children: "24/7 Live Streaming" }), _jsx("p", { className: "font-semibold text-lg leading-relaxed mb-6 flex-grow text-left", style: { color: colors.textMuted, minHeight: "4.5rem" }, children: "Non-stop old-school metal streaming with high-quality audio and minimal buffering." }), _jsxs("div", { className: "flex items-center text-sm font-bold mt-auto text-left", style: { color: colors.primary }, children: [_jsx("div", { className: "w-3 h-3 rounded-full mr-3 animate-pulse", style: { backgroundColor: colors.primary } }), _jsx("span", { children: "Currently Live" })] })] }) })] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-2 rounded-2xl overflow-hidden", children: _jsx("div", { className: "absolute inset-0 blur-xl opacity-0 transition-opacity duration-300", style: {
                                            background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent || colors.primary})`,
                                            opacity: hoveredFeature === 'archives' ? 0.3 : 0,
                                        } }) }), _jsx(Card, { className: "relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 p-8 flex flex-col h-full enhanced-glow feature-container shadow-none", style: {
                                        backgroundColor: colors.background,
                                        borderColor: colors.primary,
                                        borderWidth: '2px',
                                        borderStyle: 'solid',
                                        transform: hoveredFeature === 'archives' ? 'scale(1.05)' : 'scale(1)',
                                        boxShadow: 'none'
                                    }, onClick: () => scrollToSection("schedule"), onMouseEnter: () => setHoveredFeature('archives'), onMouseLeave: () => setHoveredFeature(null), children: _jsxs(CardContent, { className: "p-0 flex flex-col h-full", children: [_jsx("div", { className: "w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg", style: { backgroundColor: colors.primary }, children: _jsx(Archive, { className: "text-white h-8 w-8" }) }), _jsx("h3", { className: "font-black text-2xl mb-4 h-16 flex items-center text-left", style: { color: colors.text }, children: "Show Archives" }), _jsx("p", { className: "font-semibold text-lg leading-relaxed mb-6 flex-grow text-left", style: { color: colors.textMuted, minHeight: "4.5rem" }, children: "Access past shows, special episodes, and exclusive metal content on-demand." }), _jsxs("div", { className: "flex items-center text-sm font-bold mt-auto text-left", style: { color: colors.primary }, children: [_jsx("div", { className: "w-3 h-3 rounded-full mr-3 animate-pulse", style: { backgroundColor: colors.primary } }), _jsx("span", { children: "200+ hours of content" })] })] }) })] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-2 rounded-2xl overflow-hidden", children: _jsx("div", { className: "absolute inset-0 blur-xl opacity-0 transition-opacity duration-300", style: {
                                            background: `linear-gradient(135deg, ${colors.secondary || colors.primary}, ${colors.primary})`,
                                            opacity: hoveredFeature === 'map' ? 0.3 : 0,
                                        } }) }), _jsx(Card, { className: "relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 p-8 flex flex-col h-full enhanced-glow feature-container shadow-none", style: {
                                        backgroundColor: colors.background,
                                        borderColor: colors.primary,
                                        borderWidth: '2px',
                                        borderStyle: 'solid',
                                        transform: hoveredFeature === 'map' ? 'scale(1.05)' : 'scale(1)',
                                        boxShadow: 'none'
                                    }, onClick: () => scrollToSection("map"), onMouseEnter: () => setHoveredFeature('map'), onMouseLeave: () => setHoveredFeature(null), children: _jsxs(CardContent, { className: "p-0 flex flex-col h-full", children: [_jsx("div", { className: "w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg", style: { backgroundColor: colors.primary }, children: _jsx(Globe, { className: "text-white h-8 w-8" }) }), _jsx("h3", { className: "font-black text-2xl mb-4 h-16 flex items-center text-left", style: { color: colors.text }, children: "Global Listener Map" }), _jsx("p", { className: "font-semibold text-lg leading-relaxed mb-6 flex-grow text-left", style: { color: colors.textMuted, minHeight: "4.5rem" }, children: "See where metalheads around the world are tuning in from in real-time." }), _jsxs("div", { className: "flex items-center text-sm font-bold mt-auto text-left", style: { color: colors.primary }, children: [_jsx("div", { className: "w-3 h-3 rounded-full mr-3 animate-pulse", style: { backgroundColor: colors.primary } }), _jsxs("span", { children: [stats?.currentListeners || 42, " listeners online"] })] })] }) })] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-2 rounded-2xl overflow-hidden", children: _jsx("div", { className: "absolute inset-0 blur-xl opacity-0 transition-opacity duration-300", style: {
                                            background: `linear-gradient(135deg, ${colors.accent || colors.primary}, ${colors.primary})`,
                                            opacity: hoveredFeature === 'rebellion' ? 0.3 : 0,
                                        } }) }), _jsx(Card, { className: "relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 p-8 flex flex-col h-full enhanced-glow feature-container shadow-none", style: {
                                        backgroundColor: colors.background,
                                        borderColor: colors.primary,
                                        borderWidth: '2px',
                                        borderStyle: 'solid',
                                        transform: hoveredFeature === 'rebellion' ? 'scale(1.05)' : 'scale(1)',
                                        boxShadow: 'none'
                                    }, onClick: () => scrollToSection("subscribe"), onMouseEnter: () => setHoveredFeature('rebellion'), onMouseLeave: () => setHoveredFeature(null), children: _jsxs(CardContent, { className: "p-0 flex flex-col h-full", children: [_jsx("div", { className: "w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg", style: { backgroundColor: colors.primary }, children: _jsx(Crown, { className: "text-white h-8 w-8" }) }), _jsx("h3", { className: "font-black text-2xl mb-4 h-16 flex items-center text-left", style: { color: colors.text }, children: "Hairspray Rebellion" }), _jsx("p", { className: "font-semibold mb-6 text-lg leading-relaxed flex-grow text-left", style: { color: colors.textMuted }, children: "Join our premium membership for exclusive content, early access, and special perks." }), _jsx("div", { className: "flex justify-start", children: _jsxs(Button, { className: "font-bold text-lg px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 border-0 flex items-center focus:outline-none focus:ring-0", style: {
                                                        color: colors.primary,
                                                        backgroundColor: "transparent",
                                                        border: "none",
                                                    }, onMouseEnter: (e) => {
                                                        e.currentTarget.style.backgroundColor = colors.primary;
                                                        e.currentTarget.style.color = colors.primaryText || "white";
                                                    }, onMouseLeave: (e) => {
                                                        e.currentTarget.style.backgroundColor = "transparent";
                                                        e.currentTarget.style.color = colors.primary;
                                                    }, onClick: (e) => {
                                                        e.stopPropagation();
                                                        scrollToSection("subscribe");
                                                    }, children: [_jsx("span", { className: "text-left", children: "Learn More" }), _jsx(Crown, { className: "w-4 h-4 ml-2" })] }) })] }) })] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-2 rounded-2xl overflow-hidden", children: _jsx("div", { className: "absolute inset-0 blur-xl opacity-0 transition-opacity duration-300", style: {
                                            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})`,
                                            opacity: hoveredFeature === 'requests' ? 0.3 : 0,
                                        } }) }), _jsx(Card, { className: "relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 p-8 flex flex-col h-full enhanced-glow feature-container shadow-none", style: {
                                        backgroundColor: colors.background,
                                        borderColor: colors.primary,
                                        borderWidth: '2px',
                                        borderStyle: 'solid',
                                        transform: hoveredFeature === 'requests' ? 'scale(1.05)' : 'scale(1)',
                                        boxShadow: 'none'
                                    }, onClick: () => scrollToSection("submissions"), onMouseEnter: () => setHoveredFeature('requests'), onMouseLeave: () => setHoveredFeature(null), children: _jsxs(CardContent, { className: "p-0 flex flex-col h-full", children: [_jsx("div", { className: "w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg", style: { backgroundColor: colors.primary }, children: _jsx(Music, { className: "text-white h-8 w-8" }) }), _jsx("h3", { className: "font-black text-2xl mb-4 h-16 flex items-center text-left", style: { color: colors.text }, children: "Song Requests" }), _jsx("p", { className: "font-semibold mb-6 text-lg leading-relaxed flex-grow text-left", style: { color: colors.textMuted }, children: "Submit your favorite metal tracks and artist suggestions to be featured on air." }), _jsx("div", { className: "flex justify-start", children: _jsxs(Button, { className: "font-bold text-lg px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 border-0 flex items-center focus:outline-none focus:ring-0", style: {
                                                        color: colors.primary,
                                                        backgroundColor: "transparent",
                                                        border: "none",
                                                    }, onMouseEnter: (e) => {
                                                        e.currentTarget.style.backgroundColor = colors.primary;
                                                        e.currentTarget.style.color = colors.primaryText || "white";
                                                    }, onMouseLeave: (e) => {
                                                        e.currentTarget.style.backgroundColor = "transparent";
                                                        e.currentTarget.style.color = colors.primary;
                                                    }, onClick: (e) => {
                                                        e.stopPropagation();
                                                        scrollToSection("submissions");
                                                    }, children: [_jsx("span", { className: "text-left", children: "Submit Request" }), _jsx(Music, { className: "w-4 h-4 ml-2" })] }) })] }) })] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-2 rounded-2xl overflow-hidden", children: _jsx("div", { className: "absolute inset-0 blur-xl opacity-0 transition-opacity duration-300", style: {
                                            background: `linear-gradient(135deg, ${colors.secondary || colors.primary}, ${colors.accent || colors.primary})`,
                                            opacity: hoveredFeature === 'merch' ? 0.3 : 0,
                                        } }) }), _jsx(Card, { className: "relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 p-8 flex flex-col h-full enhanced-glow feature-container shadow-none", style: {
                                        backgroundColor: colors.background,
                                        borderColor: colors.primary,
                                        borderWidth: '2px',
                                        borderStyle: 'solid',
                                        transform: hoveredFeature === 'merch' ? 'scale(1.05)' : 'scale(1)',
                                        boxShadow: 'none'
                                    }, onClick: () => scrollToSection("shop"), onMouseEnter: () => setHoveredFeature('merch'), onMouseLeave: () => setHoveredFeature(null), children: _jsxs(CardContent, { className: "p-0 flex flex-col h-full", children: [_jsx("div", { className: "w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg", style: { backgroundColor: colors.primary }, children: _jsx(Shirt, { className: "text-white h-8 w-8" }) }), _jsx("h3", { className: "font-black text-2xl mb-4 h-16 flex items-center text-left", style: { color: colors.text }, children: "Official Merch" }), _jsx("p", { className: "font-semibold mb-6 text-lg leading-relaxed flex-grow text-left", style: { color: colors.textMuted }, children: "Show your metal pride with official Spandex Salvation Radio merchandise and apparel." }), _jsx("div", { className: "flex justify-start", children: _jsxs(Button, { className: "font-bold text-lg px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 border-0 flex items-center focus:outline-none focus:ring-0", style: {
                                                        color: colors.primary,
                                                        backgroundColor: "transparent",
                                                        border: "none",
                                                    }, onMouseEnter: (e) => {
                                                        e.currentTarget.style.backgroundColor = colors.primary;
                                                        e.currentTarget.style.color = colors.primaryText || "white";
                                                    }, onMouseLeave: (e) => {
                                                        e.currentTarget.style.backgroundColor = "transparent";
                                                        e.currentTarget.style.color = colors.primary;
                                                    }, onClick: (e) => {
                                                        e.stopPropagation();
                                                        scrollToSection("merch");
                                                    }, children: [_jsx("span", { className: "text-left", children: "Shop Now" }), _jsx(Shirt, { className: "w-4 h-4 ml-2" })] }) })] }) })] })] })] }) }));
}
