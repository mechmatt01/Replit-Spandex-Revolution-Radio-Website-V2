import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
export default function ActiveLocations() {
    const { getColors, currentTheme } = useTheme();
    const colors = getColors();
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        // Simulate fetching active locations data
        const fetchActiveLocations = () => {
            // Mock data for demonstration - in production this would come from your API
            const mockLocations = [
                {
                    id: "1",
                    city: "Los Angeles",
                    country: "United States",
                    listeners: 1247,
                    coordinates: { lat: 34.0522, lng: -118.2437 },
                    flag: "🇺🇸",
                    timezone: "America/Los_Angeles",
                    localTime: new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' })
                },
                {
                    id: "2",
                    city: "London",
                    country: "United Kingdom",
                    listeners: 892,
                    coordinates: { lat: 51.5074, lng: -0.1278 },
                    flag: "🇬🇧",
                    timezone: "Europe/London",
                    localTime: new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/London' })
                },
                {
                    id: "3",
                    city: "Tokyo",
                    country: "Japan",
                    listeners: 634,
                    coordinates: { lat: 35.6762, lng: 139.6503 },
                    flag: "🇯🇵",
                    timezone: "Asia/Tokyo",
                    localTime: new Date().toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })
                },
                {
                    id: "4",
                    city: "Berlin",
                    country: "Germany",
                    listeners: 578,
                    coordinates: { lat: 52.5200, lng: 13.4050 },
                    flag: "🇩🇪",
                    timezone: "Europe/Berlin",
                    localTime: new Date().toLocaleTimeString('de-DE', { timeZone: 'Europe/Berlin' })
                },
                {
                    id: "5",
                    city: "Sydney",
                    country: "Australia",
                    listeners: 423,
                    coordinates: { lat: -33.8688, lng: 151.2093 },
                    flag: "🇦🇺",
                    timezone: "Australia/Sydney",
                    localTime: new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Sydney' })
                },
                {
                    id: "6",
                    city: "São Paulo",
                    country: "Brazil",
                    listeners: 312,
                    coordinates: { lat: -23.5505, lng: -46.6333 },
                    flag: "🇧🇷",
                    timezone: "America/Sao_Paulo",
                    localTime: new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })
                }
            ];
            setTimeout(() => {
                setLocations(mockLocations);
                setIsLoading(false);
            }, 1000);
        };
        fetchActiveLocations();
        // Update times every minute
        const timeInterval = setInterval(() => {
            setLocations(prev => prev.map(location => ({
                ...location,
                localTime: new Date().toLocaleTimeString('en-US', { timeZone: location.timezone })
            })));
        }, 60000);
        return () => clearInterval(timeInterval);
    }, []);
    const totalListeners = locations.reduce((sum, location) => sum + location.listeners, 0);
    if (isLoading) {
        return (_jsx("div", { className: "p-6 rounded-xl", style: { backgroundColor: colors.cardBackground }, children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-6 w-48 mb-4 rounded", style: { backgroundColor: colors.border } }), _jsx("div", { className: "space-y-3", children: [1, 2, 3, 4, 5, 6].map((i) => (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "h-4 w-4 rounded", style: { backgroundColor: colors.border } }), _jsx("div", { className: "h-4 flex-1 rounded", style: { backgroundColor: colors.border } }), _jsx("div", { className: "h-4 w-16 rounded", style: { backgroundColor: colors.border } })] }, i))) })] }) }));
    }
    return (_jsxs("div", { className: "p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl overflow-hidden", style: {
            backgroundColor: colors.cardBackground,
            border: 'none', // Remove white borders completely
            minHeight: '600px' // Increase minimum height
        }, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "font-orbitron font-bold text-xl", style: { color: colors.text }, children: "\uD83C\uDF0D ACTIVE LOCATIONS" }), _jsxs("div", { className: "px-3 py-1 rounded-full text-sm font-semibold flex items-center justify-center", style: {
                            backgroundColor: colors.accent,
                            color: colors.background
                        }, children: [totalListeners.toLocaleString(), " Live"] })] }), _jsx("div", { className: "space-y-3 max-h-80 overflow-y-auto px-4 py-2", children: locations.map((location) => (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:scale-105 relative group", style: {
                        backgroundColor: currentTheme === 'light-mode'
                            ? 'rgba(0, 0, 0, 0.02)'
                            : 'rgba(255, 255, 255, 0.05)',
                        border: 'none', // Remove borders completely
                        transformOrigin: 'center',
                        zIndex: 1,
                        margin: '2px 0'
                    }, children: [_jsxs("div", { className: "flex items-center space-x-3 min-w-0 flex-1 overflow-hidden", children: [_jsx("span", { className: "text-2xl flex-shrink-0", children: location.flag }), _jsxs("div", { className: "min-w-0 flex-1 overflow-hidden", children: [_jsx("div", { className: "font-semibold text-sm truncate", style: { color: colors.text }, title: location.city, children: location.city }), _jsx("div", { className: "text-xs truncate", style: { color: colors.textMuted }, title: location.country, children: location.country })] })] }), _jsxs("div", { className: "text-right flex-shrink-0 ml-3 min-w-0", children: [_jsx("div", { className: "font-bold text-sm truncate", style: { color: colors.accent }, title: location.listeners.toLocaleString(), children: location.listeners.toLocaleString() }), _jsx("div", { className: "text-xs truncate", style: { color: colors.textMuted }, title: location.localTime, children: location.localTime })] })] }, location.id))) }), _jsx("div", { className: "mt-4 pt-4 text-center text-xs", style: {
                    color: colors.textMuted,
                    borderTop: 'none' // Remove border
                }, children: "Updates every minute \u2022 Live data" })] }));
}
