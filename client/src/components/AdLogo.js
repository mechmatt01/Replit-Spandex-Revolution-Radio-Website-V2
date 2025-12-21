import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from "../contexts/ThemeContext";
import { Music, AlertCircle } from 'lucide-react';
/**
 * Component for displaying appropriate logos based on content type
 * - Music content: Music icon
 * - Generic ads: Alert/Ad symbol
 * - Brand ads: Brand logo
 * - Blocked content: Default music icon (hidden from user)
 */
export function AdLogo({ isAd = false, brandLogo, brandName, className = "w-12 h-12", size = 48 }) {
    const { getColors } = useTheme();
    const colors = getColors();
    // Brand commercial with logo
    if (isAd && brandLogo && brandName) {
        return (_jsxs("div", { className: `${className} flex items-center justify-center`, children: [_jsx("img", { src: brandLogo, alt: `${brandName} Logo`, className: "w-full h-full object-contain rounded", onError: (e) => {
                        // Fallback to ad symbol if logo fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    } }), _jsx(AlertCircle, { size: size * 0.75, className: "hidden", style: { color: colors.accent } })] }));
    }
    // Generic commercial
    if (isAd) {
        return (_jsx("div", { className: `${className} flex items-center justify-center rounded-full`, style: { backgroundColor: `${colors.accent}20` }, children: _jsx(AlertCircle, { size: size * 0.6, style: { color: colors.accent } }) }));
    }
    // Regular music content
    return (_jsx("div", { className: `${className} flex items-center justify-center bg-primary/20 rounded-full`, children: _jsx(Music, { size: size * 0.6, className: "text-primary" }) }));
}
export default AdLogo;
