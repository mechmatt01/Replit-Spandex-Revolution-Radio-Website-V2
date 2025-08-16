import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import ThemedMusicLogo from "../components/ThemedMusicLogo";
import { artworkFallbackService } from "../lib/artworkFallback";
export default function InteractiveAlbumArt({ artwork, title, artist, isPlaying = false, size = "md", className = "", isAd = false, }) {
    const { getGradient, getColors, currentTheme } = useTheme();
    const colors = getColors();
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [previousGradient, setPreviousGradient] = useState(getGradient());
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [fallbackArtwork, setFallbackArtwork] = useState(null);
    const [isSearchingFallback, setIsSearchingFallback] = useState(false);
    const sizeClasses = {
        sm: "w-10 h-10 sm:w-12 sm:h-12",
        md: "w-24 h-24 sm:w-32 sm:h-32",
        lg: "w-32 h-32 sm:w-48 sm:h-48",
    };
    const logoSizes = {
        sm: "sm",
        md: "md",
        lg: "lg",
    };
    // Handle theme changes with gradient morphing
    useEffect(() => {
        const currentGradient = getGradient();
        if (currentGradient !== previousGradient && !artwork) {
            setIsTransitioning(true);
            // Create smooth gradient transition effect
            const timer = setTimeout(() => {
                setPreviousGradient(currentGradient);
                setIsTransitioning(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [currentTheme, getGradient, previousGradient, artwork]);
    // Simplified gradient transition without canvas
    useEffect(() => {
        if (isTransitioning) {
            const timer = setTimeout(() => {
                setIsTransitioning(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isTransitioning]);
    const handleImageLoad = () => {
        setImageLoaded(true);
    };
    const handleImageError = async () => {
        setImageLoaded(false);
        console.warn(`Failed to load artwork for "${title}" by ${artist}. Searching for fallback...`);
        if (!isSearchingFallback) {
            setIsSearchingFallback(true);
            try {
                const fallback = await artworkFallbackService.getArtworkWithFallback(artwork, title, artist);
                if (fallback && fallback !== artwork) {
                    setFallbackArtwork(fallback);
                    console.log(`Found fallback artwork for "${title}" by ${artist}`);
                }
            }
            catch (error) {
                console.warn('Fallback artwork search failed:', error);
            }
            finally {
                setIsSearchingFallback(false);
            }
        }
    };
    return (_jsxs("div", { className: `relative ${sizeClasses[size]} rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 ${className}`, onMouseEnter: () => setIsHovered(true), onMouseLeave: () => setIsHovered(false), style: {
            transform: isHovered ? "scale(1.05)" : "scale(1)",
            boxShadow: isHovered
                ? `0 20px 40px -12px ${getGradient()}40`
                : "0 4px 8px rgba(0,0,0,0.2)",
        }, children: [_jsx("div", { className: "absolute inset-0 flex items-center justify-center transition-all duration-500", style: {
                    background: isAd
                        ? "linear-gradient(45deg, #ff4444, #cc0000)"
                        : getGradient(),
                    opacity: !artwork ||
                        artwork === "" ||
                        !imageLoaded ||
                        artwork === "advertisement"
                        ? 1
                        : 0,
                    transform: isHovered ? "scale(1.1)" : "scale(1)",
                }, children: isAd ? (_jsxs("div", { className: "text-center text-white", children: [_jsx("div", { className: "text-2xl mb-1", children: "\uD83D\uDCE2" }), _jsx("div", { className: "text-xs font-bold", children: "AD" }), _jsx("div", { className: "text-xs opacity-80", children: "ADVERTISEMENT" })] })) : (_jsx(ThemedMusicLogo, { size: logoSizes[size] })) }), ((artwork && artwork.trim() && artwork !== "advertisement") || fallbackArtwork) && (_jsxs("div", { className: "absolute inset-0 transition-all duration-500", style: {
                    opacity: imageLoaded ? 1 : 0,
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                }, children: [_jsx("img", { src: fallbackArtwork || artwork, alt: `${title} by ${artist}`, className: "w-full h-full object-cover", onLoad: handleImageLoad, onError: handleImageError, referrerPolicy: "no-referrer", crossOrigin: "anonymous" }), _jsx("div", { className: "absolute inset-0 transition-opacity duration-300", style: {
                            background: `linear-gradient(45deg, ${getGradient()}20, transparent)`,
                            opacity: isHovered ? 1 : 0,
                        } }), isHovered && (_jsx("div", { className: "absolute inset-0 transition-opacity duration-300", style: {
                            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
                            opacity: 0.6,
                        } }))] })), artwork && !imageLoaded && (_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" }))] }));
}
