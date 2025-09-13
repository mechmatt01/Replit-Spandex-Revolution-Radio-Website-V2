import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import Features from "../components/Features";
import About from "../components/About";
import Schedule from "../components/Schedule";
import Submissions from "../components/Submissions";
import FullWidthGlobeMap from "../components/FullWidthGlobeMap";
import StatsAndLocations from "../components/StatsAndLocations";
import Contact from "../components/Contact";
import ShopifyEcommerce from "../components/ShopifyEcommerce";
import Footer from "../components/Footer";
import StickyPlayer from "../components/StickyPlayer";
import ChatButton from "../components/ChatButton";
import { useTheme } from "../contexts/ThemeContext";
import { measurePageLoad } from '../lib/performance';
import FadeInView from "../components/FadeInView";
import SubscriptionCarousel from "../components/SubscriptionCarousel";
export default function HomePage() {
    const [showLiveChat, setShowLiveChat] = useState(false);
    const { currentTheme, getColors } = useTheme();
    const colors = getColors();
    // Measure page load performance
    useEffect(() => {
        measurePageLoad('home_page');
        // Handle hash navigation on page load
        const handleHashNavigation = () => {
            const hash = window.location.hash.substring(1); // Remove the #
            if (hash) {
                setTimeout(() => {
                    const element = document.getElementById(hash);
                    if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }, 100);
            }
        };
        handleHashNavigation();
        // Listen for hash changes
        window.addEventListener('hashchange', handleHashNavigation);
        return () => {
            window.removeEventListener('hashchange', handleHashNavigation);
        };
    }, []);
    return (_jsxs("div", { className: "min-h-screen transition-colors duration-300", style: {
            backgroundColor: colors.background,
            color: colors.text
        }, children: [_jsx("div", { id: "main-navigation", children: _jsx(Navigation, {}) }), _jsxs("main", { id: "main-content", children: [_jsx(Hero, {}), _jsx(FadeInView, { direction: "up", delay: 0, children: _jsx(Features, {}) }), _jsx(FadeInView, { direction: "up", delay: 0, children: _jsx(About, {}) }), _jsx(FadeInView, { direction: "up", delay: 0, children: _jsx(Schedule, {}) }), _jsx(FadeInView, { direction: "up", delay: 0, children: _jsx("section", { id: "subscribe", className: "py-20 transition-colors duration-300", style: { backgroundColor: colors.background }, children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h2", { className: "font-orbitron font-black text-3xl md:text-4xl mb-4", style: {
                                                    color: currentTheme === 'light-mode' ? '#000000' : colors.text
                                                }, children: "Supporters Enjoy More" }), _jsx("p", { className: "text-lg font-semibold", style: {
                                                    color: currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.7)' : colors.textMuted
                                                }, children: "Support our growth and enjoy exclusive content." })] }), _jsx(SubscriptionCarousel, {})] }) }) }), _jsx(FadeInView, { direction: "up", delay: 0, children: _jsx(Submissions, {}) }), _jsx(FadeInView, { direction: "up", delay: 0, children: _jsx("section", { id: "map", className: "py-8", children: _jsx(FullWidthGlobeMap, {}) }) }), _jsx(FadeInView, { direction: "up", delay: 0, children: _jsx(StatsAndLocations, {}) }), _jsx(FadeInView, { direction: "up", delay: 0, children: _jsx(Contact, {}) }), _jsx(FadeInView, { direction: "up", delay: 0, children: _jsx(ShopifyEcommerce, {}) }), _jsx(FadeInView, { direction: "up", delay: 0, children: _jsx(Footer, {}) }), _jsx(StickyPlayer, {}), _jsx(ChatButton, { onChatClick: () => setShowLiveChat(true) })] })] }));
}
