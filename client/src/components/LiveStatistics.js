import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
export default function LiveStatistics() {
    const { getColors, currentTheme } = useTheme();
    const colors = getColors();
    const [statistics, setStatistics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        // Simulate fetching live statistics data
        const fetchLiveStatistics = () => {
            // Mock data for demonstration - in production this would come from your API
            const mockStats = [
                {
                    id: "1",
                    label: "Live Listeners",
                    value: 4086,
                    unit: "",
                    icon: "🎧",
                    trend: "up",
                    percentage: 12.5,
                    format: "number"
                },
                {
                    id: "2",
                    label: "Stream Uptime (days)",
                    value: 847,
                    unit: "",
                    icon: "📡",
                    trend: "up",
                    percentage: 100,
                    format: "number"
                },
                {
                    id: "3",
                    label: "Songs Played Today",
                    value: 342,
                    unit: "",
                    icon: "🎸",
                    trend: "up",
                    percentage: 8.3,
                    format: "number"
                },
                {
                    id: "4",
                    label: "Peak Listeners Today",
                    value: 5247,
                    unit: "",
                    icon: "📈",
                    trend: "up",
                    percentage: 15.7,
                    format: "number"
                },
                {
                    id: "5",
                    label: "Active Countries",
                    value: 67,
                    unit: "",
                    icon: "🌍",
                    trend: "stable",
                    percentage: 2.1,
                    format: "number"
                },
                {
                    id: "6",
                    label: "Avg Session (Mins)",
                    value: 47,
                    unit: "",
                    icon: "⏱️",
                    trend: "up",
                    percentage: 6.8,
                    format: "time"
                }
            ];
            setTimeout(() => {
                setStatistics(mockStats);
                setIsLoading(false);
            }, 800);
        };
        fetchLiveStatistics();
        // Update statistics every 30 seconds
        const statsInterval = setInterval(() => {
            setStatistics(prev => prev.map(stat => ({
                ...stat,
                value: stat.id === "1" ? Math.floor(Math.random() * 500) + 3800 : stat.value, // Vary live listeners
                percentage: Math.random() * 20 - 5 // Random percentage change between -5% and 15%
            })));
        }, 30000);
        return () => clearInterval(statsInterval);
    }, []);
    const formatValue = (stat) => {
        switch (stat.format) {
            case "number":
                return stat.value.toLocaleString();
            case "time":
                return `${stat.value}`;
            case "percentage":
                return `${stat.value}%`;
            default:
                return stat.value.toString();
        }
    };
    const getTrendIcon = (trend) => {
        switch (trend) {
            case "up":
                return "↗️";
            case "down":
                return "↘️";
            case "stable":
                return "➡️";
            default:
                return "➡️";
        }
    };
    const getTrendColor = (trend) => {
        switch (trend) {
            case "up":
                return "#10B981"; // Green for up
            case "down":
                return "#EF4444"; // Red for down
            case "stable":
                return "#6B7280"; // Gray for stable
            default:
                return "#6B7280"; // Gray default
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "p-6 rounded-xl", style: { backgroundColor: colors.cardBackground }, children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-6 w-48 mb-6 rounded", style: { backgroundColor: colors.border } }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: [1, 2, 3, 4, 5, 6].map((i) => (_jsxs("div", { className: "p-4 rounded-lg", style: { backgroundColor: colors.border }, children: [_jsx("div", { className: "h-4 w-3/4 mb-2 rounded", style: { backgroundColor: colors.background } }), _jsx("div", { className: "h-8 w-1/2 mb-2 rounded", style: { backgroundColor: colors.background } }), _jsx("div", { className: "h-3 w-full rounded", style: { backgroundColor: colors.background } })] }, i))) })] }) }));
    }
    return (_jsxs("div", { className: "p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl", style: {
            backgroundColor: colors.cardBackground,
            border: 'none', // Remove white borders completely
            minHeight: '600px' // Increase minimum height
        }, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "font-orbitron font-bold text-xl", style: { color: colors.text }, children: "\uD83D\uDCCA LIVE STATISTICS" }), _jsxs("div", { className: "flex items-center space-x-2 px-3 py-1 rounded-full", style: {
                            backgroundColor: '#10B981',
                            border: 'none' // Remove borders
                        }, children: [_jsx("div", { className: "w-2 h-2 rounded-full animate-pulse flex-shrink-0", style: { backgroundColor: '#ffffff' } }), _jsx("span", { className: "text-sm font-semibold flex-shrink-0", style: { color: '#ffffff' }, children: "LIVE" })] })] }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: statistics.map((stat) => (_jsxs("div", { className: "p-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md", style: {
                        backgroundColor: currentTheme === 'light-mode'
                            ? 'rgba(0, 0, 0, 0.02)'
                            : 'rgba(255, 255, 255, 0.05)',
                        border: 'none' // Remove borders completely
                    }, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-lg", children: stat.icon }), _jsxs("span", { className: "text-base font-semibold", style: { color: getTrendColor(stat.trend) }, children: [Math.abs(stat.percentage).toFixed(1), "%"] })] }), _jsx("div", { className: "text-2xl font-bold mb-1", style: { color: colors.text }, children: formatValue(stat) }), _jsx("div", { className: "text-sm font-medium", style: { color: colors.textMuted }, children: stat.label }), stat.unit && (_jsx("div", { className: "text-xs mt-1", style: { color: colors.accent }, children: stat.unit }))] }, stat.id))) }), _jsxs("div", { className: "mt-6 text-center", style: { border: 'none' }, children: [_jsxs("div", { className: "flex items-center justify-center space-x-2 text-xs", style: { color: colors.textMuted }, children: [_jsx("div", { className: "w-2 h-2 rounded-full animate-pulse flex-shrink-0", style: {
                                    backgroundColor: '#10B981'
                                } }), _jsx("span", { className: "leading-none", children: "Real-time data \u2022 Updates every 30 seconds" })] }), _jsx("div", { className: "mt-2 text-xs font-semibold", style: { color: colors.accent }, children: "\uD83C\uDFB8 Keep the metal alive! \uD83C\uDFB8" })] })] }));
}
