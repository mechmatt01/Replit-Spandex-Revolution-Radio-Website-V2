import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger, } from "../components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "../components/ui/dialog";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import { Palette, Sun, Moon, Skull, Flame, Crown, TreePine, Zap, Heart, Sparkles, Star, } from "lucide-react";
import { useTheme, METAL_THEMES, } from "../contexts/ThemeContext";
const THEME_ICONS = {
    "classic-metal": _jsx(Flame, { className: "w-4 h-4" }),
    "black-metal": _jsx(Skull, { className: "w-4 h-4" }),
    "death-metal": _jsx(Skull, { className: "w-4 h-4" }),
    "power-metal": _jsx(Crown, { className: "w-4 h-4" }),
    "doom-metal": _jsx(TreePine, { className: "w-4 h-4" }),
    "thrash-metal": _jsx(Zap, { className: "w-4 h-4" }),
    "gothic-metal": _jsx(Heart, { className: "w-4 h-4" }),
    "light-mode": _jsx(Sun, { className: "w-4 h-4" }),
    "dark-mode": _jsx(Moon, { className: "w-4 h-4" }),
    "glassmorphism-premium": _jsx(Sparkles, { className: "w-4 h-4" }),
};
export default function MetalThemeSwitcher() {
    const { currentTheme, setTheme, getColors } = useTheme();
    const { user } = useFirebaseAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showPremiumDialog, setShowPremiumDialog] = useState(false);
    const colors = getColors();
    // TODO: Check subscription status from user profile
    const hasActiveSubscription = false;
    const handleThemeClick = (themeKey, themeConfig) => {
        if (themeConfig.isPremium && !hasActiveSubscription) {
            setShowPremiumDialog(true);
            return;
        }
        setTheme(themeKey);
        setIsOpen(false);
    };
    const scrollToSubscription = () => {
        setShowPremiumDialog(false);
        setIsOpen(false);
        const subscriptionElement = document.getElementById("subscription-section");
        if (subscriptionElement) {
            subscriptionElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    };
    // Sort themes to put active theme first, then premium themes, then regular themes
    const sortedThemes = Object.entries(METAL_THEMES).sort(([keyA, configA], [keyB, configB]) => {
        if (keyA === currentTheme)
            return -1;
        if (keyB === currentTheme)
            return 1;
        if (configA.isPremium && !configB.isPremium)
            return -1;
        if (!configA.isPremium && configB.isPremium)
            return 1;
        return 0;
    });
    return (_jsx("div", { className: "flex items-center gap-2", children: _jsxs(Popover, { open: isOpen, onOpenChange: setIsOpen, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "sm", className: "flex items-center gap-2 hover:bg-opacity-20 theme-button-border focus:outline-none focus:ring-0", style: {
                            color: currentTheme === 'light-mode' ? '#000000' : colors.text,
                            backgroundColor: "transparent",
                        }, children: [_jsx(Palette, { className: "w-4 h-4", style: { color: colors.primary } }), _jsx("span", { className: "hidden sm:inline text-sm font-medium", style: {
                                    color: currentTheme === 'light-mode'
                                        ? '#3B82F6' // Blue color to match the Sun icon
                                        : colors.text
                                }, children: METAL_THEMES[currentTheme].name })] }) }), _jsx(PopoverContent, { className: "w-80 p-0 border-0 max-h-[80vh] overflow-hidden", style: {
                        backgroundColor: colors.surface,
                        border: `1px solid ${colors.border}`,
                    }, children: _jsxs(Card, { className: "border-0 shadow-xl", style: { backgroundColor: colors.surface }, children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs(CardTitle, { className: "text-lg font-black flex items-center gap-2", style: { color: colors.text }, children: [_jsx(Palette, { className: "w-5 h-5", style: { color: colors.primary } }), "Theme Selector"] }), _jsx("p", { className: "text-sm", style: { color: colors.textSecondary }, children: "Choose your visual theme" })] }), _jsx(CardContent, { className: "space-y-2 max-h-[60vh] overflow-y-auto pt-4", children: sortedThemes.map(([themeKey, themeConfig]) => {
                                    const isActive = currentTheme === themeKey;
                                    const isLightTheme = themeKey === "light-mode";
                                    const themeColors = themeConfig.colors[isLightTheme ? "light" : "dark"];
                                    const isPremium = themeConfig.isPremium;
                                    const isLocked = isPremium && !hasActiveSubscription;
                                    return (_jsx(Button, { onClick: () => handleThemeClick(themeKey, themeConfig), variant: "ghost", className: `w-full justify-start p-3 h-auto transition-all duration-200 focus:outline-none focus:ring-0 ${isActive ? "ring-2" : ""} ${isLocked ? "opacity-75" : ""}`, style: {
                                            backgroundColor: isActive
                                                ? colors.primary
                                                : "transparent",
                                            borderColor: isActive ? colors.primary : "transparent",
                                            color: isActive ? 'white' : colors.text,
                                        }, onMouseEnter: (e) => {
                                            if (!isActive && !isLocked) {
                                                // Special handling for glassmorphism theme to make hover more visible
                                                const hoverOpacity = themeKey === "glassmorphism-premium" ? "30" : "15";
                                                e.currentTarget.style.backgroundColor = `${themeColors.primary}${hoverOpacity}`;
                                                e.currentTarget.style.color = themeColors.text;
                                            }
                                        }, onMouseLeave: (e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.backgroundColor = "transparent";
                                                e.currentTarget.style.color = colors.text;
                                            }
                                        }, children: _jsxs("div", { className: "flex items-start gap-3 w-full", children: [_jsx("div", { className: "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", style: {
                                                        background: themeKey === "dark-mode"
                                                            ? "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)"
                                                            : themeKey === "glassmorphism-premium"
                                                                ? "linear-gradient(135deg, #8b0080 0%, #ff0080 25%, #ff6600 50%, #cc9900 75%, #ff0080 100%)"
                                                                : themeConfig.gradient,
                                                        color: "#ffffff",
                                                    }, children: THEME_ICONS[themeKey] }), _jsxs("div", { className: "flex-1 text-left min-w-0", children: [_jsx("div", { className: "flex items-center gap-2 justify-between", children: _jsxs("div", { className: "flex items-center gap-2 flex-1", children: [_jsx("span", { className: "font-semibold text-sm", style: { color: isActive ? 'white' : themeColors.primary }, children: themeConfig.name }), isPremium && !isActive && (_jsx(Star, { className: "w-4 h-4 flex-shrink-0", style: {
                                                                            color: "#ffd700",
                                                                            fill: "#ffd700",
                                                                            filter: isLocked
                                                                                ? "grayscale(100%) opacity(0.5)"
                                                                                : "drop-shadow(0 0 1px rgba(255, 215, 0, 0.3))",
                                                                        } })), isActive && (_jsx(Badge, { variant: "secondary", className: "text-xs px-2 py-0", style: {
                                                                            backgroundColor: 'white',
                                                                            color: colors.primary,
                                                                        }, children: "Active" }))] }) }), _jsx("p", { className: "text-xs mt-1 break-words leading-relaxed whitespace-pre-wrap overflow-hidden", style: {
                                                                color: isActive ? 'rgba(255, 255, 255, 0.8)' : `${themeColors.primary}80`,
                                                                wordBreak: "break-word",
                                                                overflowWrap: "break-word",
                                                            }, children: themeConfig.description }), _jsx("div", { className: "flex gap-1 mt-2", children: themeKey === "glassmorphism-premium" ? (_jsxs("div", { className: "flex gap-1", children: [_jsx("div", { className: "w-3 h-3 rounded-full border", style: {
                                                                            backgroundColor: "#8b0080",
                                                                            borderColor: colors.border,
                                                                        } }), _jsx("div", { className: "w-3 h-3 rounded-full border", style: {
                                                                            backgroundColor: "#ff0080",
                                                                            borderColor: colors.border,
                                                                        } }), _jsx("div", { className: "w-3 h-3 rounded-full border", style: {
                                                                            backgroundColor: "#ff6600",
                                                                            borderColor: colors.border,
                                                                        } }), _jsx("div", { className: "w-3 h-3 rounded-full border", style: {
                                                                            backgroundColor: "#cc9900",
                                                                            borderColor: colors.border,
                                                                        } })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-3 h-3 rounded-full border", style: {
                                                                            backgroundColor: themeColors.primary,
                                                                            borderColor: colors.border,
                                                                        } }), _jsx("div", { className: "w-3 h-3 rounded-full border", style: {
                                                                            backgroundColor: themeColors.secondary,
                                                                            borderColor: colors.border,
                                                                        } }), _jsx("div", { className: "w-3 h-3 rounded-full border", style: {
                                                                            backgroundColor: themeColors.accent,
                                                                            borderColor: colors.border,
                                                                        } })] })) })] })] }) }, themeKey));
                                }) }), _jsx(Dialog, { open: showPremiumDialog, onOpenChange: setShowPremiumDialog, children: _jsx(DialogContent, { className: "sm:max-w-md border-0", style: {
                                        background: "linear-gradient(135deg, #8b0080 0%, #ff0080 25%, #ff6600 50%, #cc9900 75%, #ff0080 100%)",
                                        backgroundSize: "400% 400%",
                                        animation: "glassmorphGradient 8s ease infinite",
                                        backdropFilter: "blur(20px)",
                                        border: "1px solid rgba(255, 255, 255, 0.18)",
                                    }, children: _jsxs("div", { className: "rounded-lg p-4 max-w-md mx-auto", style: {
                                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                                            backdropFilter: "blur(20px)",
                                            border: "1px solid rgba(255, 255, 255, 0.18)",
                                        }, children: [_jsxs(DialogHeader, { className: "text-center space-y-3", children: [_jsx("div", { className: "flex justify-center", children: _jsx("div", { className: "w-12 h-12 rounded-full flex items-center justify-center", style: {
                                                                background: "rgba(255, 255, 255, 0.1)",
                                                                backdropFilter: "blur(20px)",
                                                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                                            }, children: _jsx(Sparkles, { className: "w-6 h-6 text-white" }) }) }), _jsx(DialogTitle, { className: "text-xl font-bold text-white leading-tight text-center", children: "Glassmorphism Rock Theme" }), _jsx(DialogDescription, { className: "text-white/90 text-sm leading-relaxed text-center px-2", children: "Experience the ultimate rock vibe with our premium glassmorphism theme featuring vibrant colors and stunning glass effects." })] }), _jsxs("div", { className: "mt-4 space-y-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-white/80 text-xs text-center", children: "This premium theme includes:" }), _jsxs("ul", { className: "text-white text-xs mt-2 space-y-1 leading-relaxed text-center list-none", children: [_jsx("li", { children: "\u2022 Vibrant gradient backgrounds" }), _jsx("li", { children: "\u2022 Glass morphism effects" }), _jsx("li", { children: "\u2022 Rock-inspired color palette" }), _jsx("li", { children: "\u2022 Enhanced visual experience" })] })] }), _jsxs("div", { className: "flex gap-2 mt-4", children: [_jsx(Button, { onClick: () => setShowPremiumDialog(false), variant: "ghost", className: "flex-1 text-white border border-primary/30 hover:bg-white/20 font-semibold px-4 py-2 text-sm focus:outline-none focus:ring-0", style: {
                                                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                                                    backdropFilter: "blur(10px)",
                                                                    border: "1px solid rgba(59, 130, 246, 0.3)",
                                                                    borderRadius: "6px",
                                                                }, children: "Cancel" }), _jsx(Button, { onClick: scrollToSubscription, className: "flex-1 font-bold px-4 py-2 text-sm text-white focus:outline-none focus:ring-0", style: {
                                                                    background: "rgba(255, 255, 255, 0.15)",
                                                                    backdropFilter: "blur(15px)",
                                                                    border: "1px solid rgba(59, 130, 246, 0.3)",
                                                                    borderRadius: "6px",
                                                                    boxShadow: "0 4px 20px rgba(59, 130, 246, 0.1)",
                                                                }, children: "Get Premium" })] }), _jsx("div", { className: "mt-3 pt-3 border-t border-primary/20", children: _jsx(Button, { onClick: () => {
                                                                setTheme("glassmorphism-premium");
                                                                setShowPremiumDialog(false);
                                                                setIsOpen(false);
                                                            }, className: "w-full font-semibold px-4 py-2 text-xs focus:outline-none focus:ring-0", style: {
                                                                background: `${colors.accent}20`,
                                                                backdropFilter: "blur(15px)",
                                                                border: `1px solid ${colors.accent}40`,
                                                                borderRadius: "6px",
                                                                boxShadow: `0 4px 20px ${colors.accent}20`,
                                                                color: colors.accent,
                                                            }, children: "Preview Theme (Development Only)" }) })] })] }) }) })] }) })] }) }));
}
