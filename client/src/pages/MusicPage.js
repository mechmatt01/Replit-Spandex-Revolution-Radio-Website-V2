import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import RadioCoPlayer from "../components/RadioCoPlayer";
import Navigation from "../components/Navigation";
import StickyPlayer from "../components/StickyPlayer";
import { ChevronDown } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
export default function MusicPage() {
    const { colors } = useTheme();
    const [currentStation, setCurrentStation] = useState("95.5 The Beat");
    const [isStationDropdownOpen, setIsStationDropdownOpen] = useState(false);
    const stations = ["95.5 The Beat", "Hot 97", "Power 106", "SomaFM Metal"];
    const stationInfo = {
        "95.5 The Beat": {
            name: "95.5 The Beat",
            description: "Dallas' Hip Hop and R&B - Playing the hottest tracks 24/7",
            frequency: "95.5 FM",
            listeners: "100K+"
        },
        "Hot 97": {
            name: "Hot 97",
            description: "New York's Hip Hop & R&B - Where Hip Hop Lives",
            frequency: "97.1 FM",
            listeners: "500K+"
        },
        "Power 106": {
            name: "Power 106",
            description: "Los Angeles' Hip Hop Station - LA's #1 for Hip Hop",
            frequency: "105.9 FM",
            listeners: "300K+"
        },
        "SomaFM Metal": {
            name: "SomaFM Metal Detector",
            description: "From black to doom, prog to sludge, thrash to post, stoner to crossover",
            frequency: "Online",
            listeners: "50K+"
        }
    };
    const currentStationInfo = stationInfo[currentStation];
    return (_jsxs(_Fragment, { children: [_jsx(Navigation, {}), _jsx("div", { id: "music", className: "min-h-screen bg-background pt-20 pb-8", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-4xl font-black text-foreground mb-4", children: "LIVE RADIO" }), _jsx("p", { className: "text-xl text-muted-foreground mb-6", children: "Stream Your Favorite Stations 24/7" })] }), _jsx("div", { className: "max-w-4xl mx-auto mb-6", children: _jsx("div", { className: "flex justify-center", children: _jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setIsStationDropdownOpen(!isStationDropdownOpen), className: "flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 font-semibold text-white", style: {
                                                backgroundColor: colors.primary,
                                                border: `2px solid ${colors.primary}`
                                            }, onMouseEnter: (e) => {
                                                e.currentTarget.style.backgroundColor = colors.secondary;
                                            }, onMouseLeave: (e) => {
                                                e.currentTarget.style.backgroundColor = colors.primary;
                                            }, children: [_jsx("span", { children: currentStation }), _jsx(ChevronDown, { size: 16, style: {
                                                        transform: isStationDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.2s ease'
                                                    } })] }), isStationDropdownOpen && (_jsx("div", { className: "absolute top-full left-1/2 transform -translate-x-1/2 mt-2 py-2 rounded-lg shadow-xl border backdrop-blur-md z-50", style: {
                                                backgroundColor: colors.background === '#000000' ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                                borderColor: colors.primary + '40',
                                                minWidth: '200px'
                                            }, children: stations.map((station) => (_jsx("button", { onClick: () => {
                                                    setCurrentStation(station);
                                                    setIsStationDropdownOpen(false);
                                                }, className: "w-full px-4 py-2 text-left hover:rounded transition-colors duration-200", style: {
                                                    color: currentStation === station ? 'white' : colors.text,
                                                    backgroundColor: currentStation === station ? colors.primary : 'transparent'
                                                }, onMouseEnter: (e) => {
                                                    if (currentStation !== station) {
                                                        e.currentTarget.style.backgroundColor = colors.primary + '20';
                                                    }
                                                }, onMouseLeave: (e) => {
                                                    if (currentStation !== station) {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }
                                                }, children: station }, station))) }))] }) }) }), _jsx("div", { className: "max-w-4xl mx-auto", children: _jsx(RadioCoPlayer, {}) }), _jsx("div", { className: "max-w-4xl mx-auto mt-8", children: _jsxs("div", { className: "bg-black/90 backdrop-blur-md rounded-lg p-6 border", style: { borderColor: colors.primary + '20' }, children: [_jsxs("h2", { className: "text-2xl font-bold mb-4", style: { color: colors.text }, children: ["About ", currentStationInfo.name] }), _jsx("p", { className: "mb-4", style: { color: colors.text, opacity: 0.8 }, children: currentStationInfo.description }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mt-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "font-bold text-xl", style: { color: colors.primary }, children: "24/7" }), _jsx("div", { style: { color: colors.text, opacity: 0.6 }, children: "Live Broadcasting" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "font-bold text-xl", style: { color: colors.primary }, children: currentStationInfo.frequency }), _jsx("div", { style: { color: colors.text, opacity: 0.6 }, children: "Frequency" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "font-bold text-xl", style: { color: colors.primary }, children: currentStationInfo.listeners }), _jsx("div", { style: { color: colors.text, opacity: 0.6 }, children: "Active Listeners" })] })] })] }) })] }) }), _jsx(StickyPlayer, {})] }));
}
