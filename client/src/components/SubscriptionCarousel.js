import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Check, Star, Zap, Crown } from "lucide-react";
import { Button } from "../components/ui/button";
import { useTheme } from "../contexts/ThemeContext";
import { cn } from "../lib/utils";
// Import package icons
import RebelPackageIcon from "/RebelPackageIcon.png";
import LegendPackageIcon from "/LegendPackageIcon.png";
import IconPackageIcon from "/IconPackageIcon.png";
const subscriptionTiers = [
    {
        id: "rebel",
        name: "REBEL",
        price: 5.99,
        priceId: "price_rebel_monthly",
        icon: RebelPackageIcon,
        iconElement: _jsx(Zap, { className: "w-16 h-16" }),
        gradientStart: "#B56BFF",
        gradientEnd: "#FF50C3",
        description: "Start your metal journey",
        features: [
            "Ad-free streaming experience",
            "High-quality audio (320kbps)",
            "Monthly exclusive playlist",
            "Priority song requests",
        ],
        perks: ["🎸 Guitar picks monthly", "⚡ Early access to new shows"],
    },
    {
        id: "legend",
        name: "LEGEND",
        price: 12.99,
        priceId: "price_legend_monthly",
        popular: true,
        icon: LegendPackageIcon,
        iconElement: _jsx(Star, { className: "w-16 h-16" }),
        gradientStart: "#E520C6",
        gradientEnd: "#F4654F",
        description: "Become a true metal legend",
        features: [
            "Everything in Rebel tier",
            "Exclusive live show access",
            "Artist interview archives",
            "VIP Discord community",
            "Monthly exclusive merch discount",
        ],
        perks: ["🎤 Monthly video calls with DJs", "🎁 Quarterly mystery box", "💿 Signed albums"],
    },
    {
        id: "icon",
        name: "ICON",
        price: 24.99,
        priceId: "price_icon_monthly",
        icon: IconPackageIcon,
        iconElement: _jsx(Crown, { className: "w-16 h-16" }),
        gradientStart: "#00D4FF",
        gradientEnd: "#5200FF",
        description: "The ultimate metal experience",
        features: [
            "Everything in Legend tier",
            "Personal DJ requests",
            "Exclusive artist meet & greets",
            "Limited edition vinyl access",
            "Co-host opportunities",
        ],
        perks: ["🎤 Name a weekly show segment", "🏆 Annual VIP concert tickets", "👕 Custom merch line"],
    },
];
export default function SubscriptionCarousel() {
    const [currentIndex, setCurrentIndex] = useState(1); // Start with Legend (most popular)
    const [isAnimating, setIsAnimating] = useState(false);
    const [slideDirection, setSlideDirection] = useState('right');
    const [hoveredTier, setHoveredTier] = useState(null);
    const { getColors, currentTheme } = useTheme();
    const colors = getColors();
    const handleSubscribe = (tier) => {
        console.log('Subscribing to tier:', tier.name);
        // TODO: Implement subscription logic
        // This would typically redirect to Stripe checkout or handle subscription
        alert(`Redirecting to ${tier.name} subscription...`);
    };
    const handlePrevious = useCallback(() => {
        if (!isAnimating) {
            console.log('Previous animation starting');
            setIsAnimating(true);
            setSlideDirection('right');
            setCurrentIndex((prev) => (prev - 1 + (subscriptionTiers?.length || 0)) % (subscriptionTiers?.length || 1));
            setTimeout(() => {
                setIsAnimating(false);
                console.log('Previous animation complete');
            }, 400);
        }
    }, [isAnimating]);
    const handleNext = useCallback(() => {
        if (!isAnimating) {
            console.log('Next animation starting');
            setIsAnimating(true);
            setSlideDirection('left');
            setCurrentIndex((prev) => (prev + 1) % (subscriptionTiers?.length || 1));
            setTimeout(() => {
                setIsAnimating(false);
                console.log('Next animation complete');
            }, 400);
        }
    }, [isAnimating]);
    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                handlePrevious();
            }
            else if (event.key === 'ArrowRight') {
                event.preventDefault();
                handleNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlePrevious, handleNext]);
    const handleSelectTier = (index) => {
        if (!isAnimating && index !== currentIndex) {
            setIsAnimating(true);
            setCurrentIndex(index);
            setTimeout(() => setIsAnimating(false), 500);
        }
    };
    const currentTier = subscriptionTiers[currentIndex];
    return (_jsxs("div", { className: "relative w-full max-w-6xl mx-auto px-4", children: [_jsxs("div", { className: "relative perspective-1000 subscription-carousel-container overflow-visible py-2 sm:py-4 md:py-6 lg:py-8", style: {
                    minHeight: '700px',
                    height: 'auto'
                }, children: [_jsx("button", { onClick: handlePrevious, disabled: isAnimating, className: "absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-all duration-300 focus:outline-none focus:ring-0", style: {
                            border: `1px solid ${colors.border}`,
                        }, children: _jsx(ChevronLeft, { className: "w-6 h-6" }) }), _jsx("button", { onClick: handleNext, disabled: isAnimating, className: "absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-all duration-300 focus:outline-none focus:ring-0", style: {
                            border: `1px solid ${colors.border}`,
                        }, children: _jsx(ChevronRight, { className: "w-6 h-6" }) }), _jsx("div", { className: "flex items-center justify-center h-full relative", children: _jsxs("div", { className: "relative w-full max-w-md", style: {
                                transform: isAnimating ?
                                    (slideDirection === 'left' ?
                                        'translateX(30px) scale(0.98)' :
                                        'translateX(-30px) scale(0.98)') : 'translateX(0) scale(1)',
                                opacity: isAnimating ? 0.8 : 1,
                                transition: 'all 0.4s ease-in-out'
                            }, children: [_jsx("div", { className: "absolute inset-4 rounded-3xl overflow-hidden", children: _jsx("div", { className: "absolute inset-0 blur-2xl opacity-40", style: {
                                            background: `linear-gradient(135deg, ${currentTier.gradientStart}, ${currentTier.gradientEnd})`,
                                        } }) }), _jsx("div", { className: "relative overflow-hidden transition-all duration-500", style: {
                                        borderRadius: "24px", // Fully rounded border wrapper
                                        background: `linear-gradient(45deg, ${currentTier.gradientStart}, ${currentTier.gradientEnd}, ${currentTier.gradientStart}, ${currentTier.gradientEnd})`,
                                        backgroundSize: '400% 400%',
                                        animation: 'slowRotatingGradient 8s linear infinite',
                                        transform: hoveredTier === currentTier.id ? 'scale(1.05)' : 'scale(1)', // Move transform to border wrapper
                                        padding: '5px', // Increased border width by 2.5px (from 2.5px to 5px)
                                    }, children: _jsxs("div", { className: "relative backdrop-blur-xl p-6 overflow-hidden flex flex-col subscription-card", style: {
                                            borderRadius: "19px", // Adjusted to match increased border wrapper padding (24px - 5px = 19px)
                                            backgroundColor: colors.background, // Use theme background color instead of surface
                                            background: colors.background,
                                            boxShadow: currentTier.popular
                                                ? `0 0 60px ${currentTier.gradientStart}60, 0 0 120px ${currentTier.gradientEnd}40, 0 0 160px ${currentTier.gradientStart}20, inset 0 0 0 1px ${currentTier.gradientStart}40`
                                                : `0 20px 40px ${currentTier.gradientStart}40, inset 0 0 0 1px ${currentTier.gradientStart}30`,
                                            minHeight: "600px", // Minimum height for mobile devices
                                            height: "auto", // Auto height to prevent content cutoff
                                            transition: "none", // Remove individual card transition since it's handled by border wrapper
                                        }, onMouseEnter: () => setHoveredTier(currentTier.id), onMouseLeave: () => setHoveredTier(null), children: [_jsx("div", { className: "flex justify-center mb-2 sm:mb-4", children: _jsx("div", { className: "relative p-2 sm:p-3 rounded-full", style: {
                                                        background: `linear-gradient(135deg, ${currentTier.gradientStart}20, ${currentTier.gradientEnd}20)`,
                                                    }, children: _jsx("img", { src: currentTier.icon, alt: `${currentTier.name} icon`, className: `w-16 h-16 sm:w-20 sm:h-20 object-contain animate-float ${currentIndex === 1 ? 'float-delay-1' :
                                                            currentIndex === 2 ? 'float-delay-2' : ''}`, style: {
                                                            animation: 'float 4s ease-in-out infinite',
                                                            animationDelay: currentIndex === 1 ? '0.5s' : currentIndex === 2 ? '1s' : '0s'
                                                        } }) }) }), _jsxs("div", { className: "text-center mb-2 sm:mb-4", children: [_jsx("h3", { className: "text-2xl sm:text-3xl font-black mb-1 sm:mb-2", children: _jsx("span", { style: {
                                                                background: `linear-gradient(90deg, ${currentTier.gradientStart}, ${currentTier.gradientEnd})`,
                                                                WebkitBackgroundClip: "text",
                                                                WebkitTextFillColor: "transparent",
                                                                backgroundClip: "text",
                                                                color: "transparent",
                                                                display: "inline",
                                                                padding: 0,
                                                                margin: 0,
                                                                fontWeight: "inherit",
                                                            }, children: currentTier.name }, currentTier.id) }), _jsx("p", { className: "text-sm sm:text-base", style: {
                                                            color: currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.6)' : '#9ca3af'
                                                        }, children: currentTier.description }), currentTier.popular && (_jsx("div", { className: "mt-4", children: _jsx("span", { className: "px-4 py-1 rounded-full text-xs font-bold", style: {
                                                                background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                                                                color: "black",
                                                                whiteSpace: "nowrap",
                                                            }, children: "MOST\u00A0POPULAR" }) }))] }), _jsx("div", { className: "text-center mb-3 sm:mb-6", children: _jsxs("div", { className: "flex items-center justify-center", children: [_jsxs("span", { className: "text-3xl sm:text-4xl font-black", style: {
                                                                color: currentTheme === 'light-mode' ? '#000000' : '#ffffff'
                                                            }, children: ["$", currentTier.price] }), _jsx("span", { className: "ml-2 text-sm sm:text-base", style: {
                                                                color: currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.6)' : '#9ca3af'
                                                            }, children: "/month" })] }) }), _jsx("div", { className: "flex-1 flex items-center justify-center py-2 sm:py-4", children: _jsx("div", { className: "w-full max-w-xs", children: (currentTier.features || []).sort((a, b) => (a?.length || 0) - (b?.length || 0)).map((feature, index) => (_jsx("div", { className: "flex items-center justify-center mb-2 sm:mb-3 transform transition-all duration-300", style: {
                                                            transform: hoveredTier === currentTier.id ? "translateX(10px)" : "translateX(0)",
                                                            transitionDelay: `${index * 50}ms`,
                                                        }, children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center flex-shrink-0 mr-2 sm:mr-3", style: {
                                                                        background: `linear-gradient(135deg, ${currentTier.gradientStart}, ${currentTier.gradientEnd})`,
                                                                    }, children: _jsx(Check, { className: "w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" }) }), _jsx("span", { className: "text-xs sm:text-sm font-medium text-center", style: {
                                                                        color: currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.7)' : '#d1d5db'
                                                                    }, children: feature })] }) }, index))) }) }), _jsx("div", { className: "mb-2 sm:mb-3", children: _jsxs("div", { className: "bg-white/5 rounded-lg p-2 sm:p-3 max-w-xs mx-auto", children: [_jsx("h4", { className: "text-xs font-bold mb-1 sm:mb-2 text-center", style: {
                                                                color: currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.6)' : '#9ca3af'
                                                            }, children: "EXCLUSIVE PERKS" }), _jsx("div", { className: "space-y-0.5 sm:space-y-1", children: (currentTier.perks || []).map((perk, index) => (_jsx("div", { className: "text-xs text-center leading-tight", style: {
                                                                    color: currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.7)' : '#d1d5db'
                                                                }, children: perk }, index))) })] }) }), _jsx("div", { className: "mt-auto mb-3 sm:mb-4", children: _jsxs(Button, { onClick: () => handleSubscribe(currentTier), className: "w-full py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-0", style: {
                                                        background: `linear-gradient(135deg, ${currentTier.gradientStart}, ${currentTier.gradientEnd})`,
                                                        color: "white",
                                                        boxShadow: `0 8px 32px ${currentTier.gradientStart}40`,
                                                    }, children: ["Get ", currentTier.name.charAt(0) + currentTier.name.slice(1).toLowerCase(), " Now"] }) })] }) }), " "] }) })] }), _jsxs("div", { className: "text-center text-gray-500 text-sm mt-8", children: [_jsx("span", { className: "md:hidden", children: "\u2190 Swipe to explore plans \u2192" }), _jsx("span", { className: "hidden md:inline", children: "\u2190 Click to explore plans \u2192" })] }), _jsx("div", { className: "flex justify-center items-center space-x-6 mt-6", children: (subscriptionTiers || []).map((tier, index) => (_jsxs("button", { onClick: () => handleSelectTier(index), className: cn("relative transition-all duration-500 ease-in-out p-3 rounded-full focus:outline-none focus:ring-0", index === currentIndex
                        ? "scale-110"
                        : "opacity-40 hover:opacity-60 scale-90"), children: [_jsx("div", { className: cn("absolute inset-0 rounded-full transition-all duration-500", index === currentIndex ? "opacity-100" : "opacity-0"), style: {
                                background: `radial-gradient(circle, ${tier.gradientStart}20, transparent 70%)`,
                                filter: "blur(12px)",
                            } }), _jsx("div", { className: cn("relative rounded-full transition-all duration-500", index === currentIndex ? "bg-black/20" : "bg-transparent"), style: {
                                padding: "0.5rem",
                            }, children: _jsx("img", { src: tier.icon, alt: `${tier.name} icon`, className: cn("object-contain transition-all duration-500", index === currentIndex ? "w-8 h-8" : "w-6 h-6"), style: {
                                    filter: index === currentIndex
                                        ? "drop-shadow(0 0 8px rgba(255,255,255,0.5))"
                                        : "grayscale(100%) opacity(0.7)",
                                } }) }), index === currentIndex && (_jsx("div", { className: "absolute inset-0 rounded-full", style: {
                                background: `linear-gradient(135deg, ${tier.gradientStart}60, ${tier.gradientEnd}60)`,
                                padding: "2px",
                                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                WebkitMaskComposite: "xor",
                                maskComposite: "exclude",
                            } }))] }, tier.id))) }), _jsx("style", { children: `
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      ` })] }));
}
