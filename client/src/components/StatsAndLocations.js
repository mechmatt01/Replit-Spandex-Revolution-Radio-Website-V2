import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import ActiveLocations from "./ActiveLocations";
import LiveStatistics from "./LiveStatistics";
export default function StatsAndLocations() {
    const { getColors, currentTheme } = useTheme();
    const colors = getColors();
    const [activeTab, setActiveTab] = useState("stats");
    return (_jsx("section", { className: "py-16 transition-colors duration-300", style: {
            backgroundColor: colors.background,
            border: 'none' // Remove borders completely
        }, children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h2", { className: "font-orbitron font-black text-3xl md:text-4xl mb-4", style: {
                                color: currentTheme === 'light-mode' ? '#000000' : colors.text
                            }, children: "Real-Time Dashboard" }), _jsx("p", { className: "text-lg font-semibold max-w-2xl mx-auto", style: {
                                color: currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.7)' : colors.textMuted
                            }, children: "Monitor live listener activity and global engagement across all platforms" })] }), _jsx("div", { className: "md:hidden mb-6", children: _jsxs("div", { className: "flex rounded-lg p-1 relative", style: {
                            backgroundColor: colors.cardBackground,
                            border: 'none' // Remove borders
                        }, children: [_jsx("div", { className: "absolute top-1 bottom-1 rounded-md transition-all duration-300 ease-out", style: {
                                    backgroundColor: colors.accent,
                                    left: activeTab === "stats" ? "4px" : "calc(50% + 2px)",
                                    width: "calc(50% - 4px)",
                                    zIndex: 1
                                } }), _jsx("button", { onClick: () => setActiveTab("stats"), className: "flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-200 relative z-10 focus:outline-none focus:ring-0", style: {
                                    color: activeTab === "stats" ? colors.background : colors.textMuted,
                                    border: 'none' // Remove borders
                                }, children: "Live Statistics" }), _jsx("button", { onClick: () => setActiveTab("locations"), className: "flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-200 relative z-10 focus:outline-none focus:ring-0", style: {
                                    color: activeTab === "locations" ? colors.background : colors.textMuted,
                                    border: 'none' // Remove borders
                                }, children: "Active Locations" })] }) }), _jsxs("div", { className: "hidden md:grid md:grid-cols-2 gap-8", children: [_jsx(LiveStatistics, {}), _jsx(ActiveLocations, {})] }), _jsxs("div", { className: "md:hidden", children: [activeTab === "stats" && _jsx(LiveStatistics, {}), activeTab === "locations" && _jsx(ActiveLocations, {})] }), _jsx("div", { className: "mt-16 text-center", children: _jsxs("div", { className: "inline-flex items-center space-x-2 px-4 py-2 rounded-full", style: {
                            backgroundColor: colors.cardBackground,
                            border: 'none' // Remove borders
                        }, children: [_jsx("div", { className: "w-2 h-2 rounded-full animate-pulse flex-shrink-0 relative", style: {
                                    backgroundColor: '#10B981',
                                    top: '0px' // Ensure perfect vertical alignment
                                } }), _jsx("span", { className: "text-sm font-semibold leading-none", style: { color: colors.text }, children: "Real-time data \u2022 Updates every 30 seconds" })] }) })] }) }));
}
