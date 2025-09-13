import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import RadioCoPlayer from "../components/RadioCoPlayer";
import { useTheme } from "../contexts/ThemeContext";
const HeroComponent = React.memo(function HeroComponent() {
    const { isDarkMode, getColors, currentTheme } = useTheme();
    const colors = getColors();
    const scrollToSchedule = useCallback(() => {
        document.getElementById("schedule")?.scrollIntoView({ behavior: "smooth" });
    }, []);
    const [countdown, setCountdown] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    // Memoize the launch date calculation
    const launchDate = useMemo(() => new Date("2025-08-10T12:00:00").getTime(), []);
    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = launchDate - now;
            if (distance > 0) {
                setCountdown({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                });
            }
        };
        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, [launchDate]);
    // Memoize styles to prevent unnecessary re-renders
    const heroTitleStyle = useMemo(() => ({
        color: colors.text,
        textShadow: `0 0 20px ${colors.primary}40`,
    }), [colors.text, colors.primary]);
    const backgroundOverlayStyle = useMemo(() => ({
        background: `linear-gradient(135deg, ${colors.background}80, ${colors.background}40)`,
    }), [colors.background]);
    const centerOverlayStyle = useMemo(() => ({
        background: `radial-gradient(circle at center, transparent 0%, ${colors.background}90 70%, ${colors.background} 100%)`,
    }), [colors.background]);
    const countdownLabelStyle = useMemo(() => ({
        color: currentTheme === 'light-mode' ? '#374151' : colors.textMuted
    }), [currentTheme, colors.textMuted]);
    const countdownDescriptionStyle = useMemo(() => ({
        color: currentTheme === 'light-mode' ? '#212936' : colors.textMuted
    }), [currentTheme, colors.textMuted]);
    return (_jsxs(_Fragment, { children: [_jsx("style", { children: `
          @keyframes customPulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(1.1);
            }
          }
        ` }), _jsxs("div", { className: "relative min-h-screen flex items-center justify-center overflow-hidden pt-20", children: [_jsxs("div", { className: "absolute inset-0 -top-16", children: [_jsx("div", { className: "absolute inset-0 bg-cover bg-center opacity-25 dark:opacity-20 light:opacity-35", style: {
                                    backgroundImage: "url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
                                } }), _jsx("div", { className: "absolute inset-0 transition-all duration-300", style: backgroundOverlayStyle }), _jsx("div", { className: "absolute inset-0 transition-all duration-300", style: centerOverlayStyle })] }), _jsxs("div", { className: "relative z-10 text-center max-w-4xl mx-auto px-4 pt-12", children: [_jsxs("h1", { className: "font-orbitron font-black text-5xl md:text-8xl mb-8", style: heroTitleStyle, children: [_jsx("div", { children: "SPANDEX" }), _jsx("div", { children: "SALVATION" }), _jsx("div", { children: "RADIO" })] }), _jsxs("p", { className: "text-lg md:text-xl font-orbitron font-semibold mb-6 max-w-2xl mx-auto text-center", style: {
                                    color: currentTheme === 'light-mode' ? '#212936' : colors.textMuted
                                }, children: ["Bringing you the best of old-school metal with legendary", _jsx("br", {}), "bands like Skid Row, Twisted Sister, and more.", _jsx("br", {}), "Join the hairspray rebellion!"] }), _jsxs("div", { className: "mb-8 flex flex-col justify-center items-center", children: [_jsx("p", { className: "font-orbitron font-black text-xl md:text-2xl mb-1", style: { color: colors.primary }, children: "Old School Metal" }), _jsx("p", { className: "font-orbitron font-black text-base md:text-lg", style: { color: colors.primary }, children: "24/7 Live Stream" })] }), _jsxs("div", { className: "mb-8 flex flex-col items-center", role: "timer", "aria-label": "Live broadcast countdown", children: [_jsxs("div", { className: "flex flex-col items-center mb-4", children: [_jsx("div", { className: "relative mb-3 flex justify-center", "aria-hidden": "true", children: _jsx("div", { className: "w-4 h-4 bg-gradient-to-r from-red-500 to-primary rounded-full shadow-lg", style: {
                                                        animation: 'customPulse 2s ease-in-out infinite'
                                                    } }) }), _jsx("div", { className: "text-center w-full", children: _jsx("span", { className: "text-transparent bg-gradient-to-r from-red-500 to-primary bg-clip-text text-xl font-black tracking-wider", children: "LIVE IN" }) })] }), _jsxs("div", { className: "flex justify-center items-center space-x-4 text-center mb-4 w-full max-w-md mx-auto", children: [_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center p-3 min-w-[80px] transition-colors duration-300", children: [_jsx("div", { className: "text-3xl font-bold text-red-500 mb-2 text-center w-full leading-none", children: countdown.days }), _jsx("div", { className: "text-xs font-semibold text-center w-full leading-tight", style: countdownLabelStyle, children: "DAYS" })] }), _jsxs("div", { className: "flex-1 flex flex-col items-center justify-center p-3 min-w-[80px] transition-colors duration-300", children: [_jsx("div", { className: "text-3xl font-bold text-red-500 mb-2 text-center w-full leading-none", children: countdown.hours }), _jsx("div", { className: "text-xs font-semibold text-center w-full leading-tight", style: countdownLabelStyle, children: "HOURS" })] }), _jsxs("div", { className: "flex-1 flex flex-col items-center justify-center p-3 min-w-[80px] transition-colors duration-300", children: [_jsx("div", { className: "text-3xl font-bold text-red-500 mb-2 text-center w-full leading-none", children: countdown.minutes }), _jsx("div", { className: "text-xs font-semibold text-center w-full leading-tight", style: countdownLabelStyle, children: "MINS" })] }), _jsxs("div", { className: "flex-1 flex flex-col items-center justify-center p-3 min-w-[80px] transition-colors duration-300", children: [_jsx("div", { className: "text-3xl font-bold text-red-500 mb-2 text-center w-full leading-none", children: countdown.seconds }), _jsx("div", { className: "text-xs font-semibold text-center w-full leading-tight", style: countdownLabelStyle, children: "SECS" })] })] }), _jsx("div", { className: "text-center w-full", children: _jsx("p", { className: "text-sm font-semibold opacity-80", style: countdownDescriptionStyle, children: "First Broadcast Countdown" }) })] }), _jsx("div", { className: "flex flex-col items-center justify-center space-y-6 mb-12 mt-8", children: _jsx(RadioCoPlayer, {}) })] }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent transition-colors duration-300" })] })] }));
});
export default HeroComponent;
