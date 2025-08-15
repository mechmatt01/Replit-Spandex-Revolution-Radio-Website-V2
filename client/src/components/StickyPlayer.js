import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { useRadio } from "../contexts/RadioContext";
import { useTheme } from "../contexts/ThemeContext";
import ScrollingText from "../components/ScrollingText";
import InteractiveAlbumArt from "../components/InteractiveAlbumArt";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
export default function StickyPlayer() {
    const { isPlaying, volume, currentTrack, stationName, togglePlayback, setVolume, isLoading, isMuted, toggleMute, isAdPlaying, adInfo, } = useRadio();
    const { user, updateListeningStatus } = useFirebaseAuth();
    const { getGradient, getColors, currentTheme } = useTheme();
    const colors = getColors();
    // Get theme context for styling
    const [isVisible, setIsVisible] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const handleVolumeChange = (e) => {
        const newVolume = parseInt(e.target.value) / 100;
        setVolume(newVolume);
        if (isMuted && newVolume > 0) {
            toggleMute();
        }
    };
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const documentHeight = document.documentElement.scrollHeight;
            const windowHeight = window.innerHeight;
            const footerOffset = 200; // Approximate footer height where player should hide
            const isNearBottom = currentScrollY + windowHeight >= documentHeight - footerOffset;
            // Player is visible unless user is near bottom footer
            setIsVisible(!isNearBottom);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    // Handle play/pause with listening status update
    const handlePlayPause = async () => {
        try {
            await togglePlayback();
            // Update listening status based on new play state
            if (user) {
                await updateListeningStatus(!isPlaying);
            }
        }
        catch (error) {
            console.error('Error toggling playback:', error);
        }
    };
    return (_jsx("div", { className: `fixed bottom-2 left-4 backdrop-blur-md z-50 transition-all duration-1000 ease-in-out rounded-2xl shadow-2xl border-0 floating-player-no-focus ${isVisible
            ? "transform translate-y-0 opacity-100"
            : "transform translate-y-full opacity-0"}`, style: {
            width: "320px",
            maxWidth: "calc(100vw - 32px)",
            background: 'rgba(0, 0, 0, 0.12)',
            backdropFilter: 'blur(32px) saturate(220%)',
            WebkitBackdropFilter: 'blur(32px) saturate(220%)',
            boxShadow: `0 14px 48px ${colors.primary}25, 0 0 24px ${colors.primary}12`,
            color: colors.text,
            border: 'none',
            outline: 'none'
        }, role: "region", "aria-label": "Floating audio player", "aria-live": "polite", children: _jsx("div", { className: "w-full px-3 py-2 relative", children: _jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(InteractiveAlbumArt, { artwork: isAdPlaying && adInfo.artwork ? adInfo.artwork : currentTrack.artwork, title: currentTrack.title, artist: currentTrack.artist, size: "sm", className: "w-12 h-12 shadow-none", isAd: isAdPlaying }), _jsxs("div", { className: "min-w-0 ml-3 focus-safe-area", style: { width: "60%" }, children: [isAdPlaying && (_jsx("div", { className: "mb-1 flex justify-start", children: _jsxs("div", { className: "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold text-white animate-pulse", style: {
                                        background: `linear-gradient(45deg, #ff4444, #cc0000)`,
                                        boxShadow: `0 1px 4px #ff444460`,
                                    }, children: [_jsx("span", { className: "mr-1 text-xs", children: "\uD83D\uDCE2" }), "AD", adInfo.company && (_jsxs("span", { className: "ml-1 opacity-80 text-xs", children: ["\u2022 ", adInfo.company] }))] }) })), _jsx("div", { className: "w-full overflow-hidden", children: _jsx(ScrollingText, { text: currentTrack.title !== stationName
                                        ? currentTrack.title
                                        : stationName, className: "font-semibold text-xs whitespace-nowrap", style: {
                                        color: isAdPlaying ? '#f87171' : colors.text
                                    }, maxWidth: "85%", isFloating: true, backgroundColor: "transparent", alignment: "left" }) }), currentTrack.artist &&
                                currentTrack.artist !== currentTrack.title &&
                                currentTrack.artist !== stationName && (_jsx("div", { className: "text-xs truncate mt-0.5", style: {
                                    color: colors.textMuted
                                }, children: currentTrack.artist })), _jsxs("div", { className: "flex items-center justify-between mt-1", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("div", { className: `w-2 h-2 rounded-full animate-pulse relative ${isAdPlaying ? 'bg-red-600' : 'bg-red-500'}`, style: { top: '0px' } }), _jsx("span", { className: `text-xs font-medium ${isAdPlaying ? 'text-red-600' : 'text-red-500'}`, children: isAdPlaying ? 'AD' : 'LIVE' })] }), _jsx("div", { className: "hidden sm:flex items-center justify-center flex-1 mx-2 focus-safe-area", children: _jsxs("div", { className: "flex items-center space-x-2 focus-safe-area", children: [_jsx(Volume2, { className: "h-3 w-3 cursor-pointer transition-colors", style: {
                                                        color: isMuted
                                                            ? '#ef4444' // Red for muted
                                                            : currentTheme === 'light-mode'
                                                                ? '#4b5563' // Gray for light mode
                                                                : '#9ca3af' // Light gray for dark modes
                                                    }, onMouseEnter: (e) => {
                                                        if (!isMuted) {
                                                            e.currentTarget.style.color = currentTheme === 'light-mode'
                                                                ? '#374151'
                                                                : '#d1d5db';
                                                        }
                                                    }, onMouseLeave: (e) => {
                                                        e.currentTarget.style.color = isMuted
                                                            ? '#ef4444'
                                                            : currentTheme === 'light-mode'
                                                                ? '#4b5563'
                                                                : '#9ca3af';
                                                    }, onClick: toggleMute }), _jsxs("div", { className: "w-16 h-1 rounded-full relative", style: {
                                                        backgroundColor: currentTheme === 'light-mode'
                                                            ? '#d1d5db' // Light gray for light mode
                                                            : '#374151' // Dark gray for dark modes
                                                    }, children: [_jsx("div", { className: "h-1 rounded-full transition-all duration-150", style: {
                                                                width: `${(isMuted ? 0 : volume) * 100}%`,
                                                                background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                                                            } }), _jsx("input", { type: "range", min: "0", max: "100", value: (isMuted ? 0 : volume) * 100, onChange: handleVolumeChange, className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer", "aria-label": "Volume control", title: "Adjust volume" })] }), _jsxs("span", { className: "text-xs font-medium min-w-[20px] text-center", style: {
                                                        color: currentTheme === 'light-mode'
                                                            ? '#6b7280' // Gray for light mode
                                                            : '#9ca3af' // Light gray for dark modes
                                                    }, children: [Math.round((isMuted ? 0 : volume) * 100), "%"] })] }) })] })] }), _jsxs("div", { className: "relative", children: [isLoading && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("div", { className: "w-7 h-7 border-2 border-t-transparent rounded-full animate-spin", style: {
                                        borderColor: colors.primary,
                                        borderTopColor: 'transparent'
                                    } }) })), _jsx(Button, { onClick: handlePlayPause, className: "text-white w-10 h-10 rounded-full   flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl border-0", style: {
                                    background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                                    boxShadow: `0 4px 20px ${colors.primary}60`,
                                    opacity: isLoading ? 0.5 : 1,
                                    border: "none",
                                    outline: "none",
                                    '--tw-ring-color': colors.primary,
                                }, "aria-label": isPlaying ? "Pause radio stream" : "Play radio stream", disabled: isLoading, children: !isLoading && (_jsx(_Fragment, { children: isPlaying ? (_jsx("svg", { className: "h-6 w-6", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("rect", { x: "4", y: "4", width: "16", height: "16", rx: "4", strokeLinejoin: "round", strokeLinecap: "round" }) })) : (_jsx("svg", { className: "h-6 w-6", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M8 5c0-.6.4-1 1-1 .2 0 .5.1.7.3l9 7c.8.6.8 1.8 0 2.4l-9 7c-.2.2-.5.3-.7.3-.6 0-1-.4-1-1V5z" }) })) })) })] })] }) }) }));
}
