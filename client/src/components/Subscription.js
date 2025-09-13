import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useCallback, useState } from "react";
import { useScrollVelocity } from "../hooks/use-scroll-velocity";
import { useIntersectionObserver } from "../hooks/use-intersection-observer";
import { useTheme } from "../contexts/ThemeContext";
export default function Subscription() {
    const { velocity } = useScrollVelocity();
    const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
    const { currentTheme, isDarkMode } = useTheme();
    const [selectedPlan, setSelectedPlan] = useState('basic');
    // Memoize expensive calculations
    const scrollIntensity = useMemo(() => {
        return Math.min(Math.abs(velocity) / 1000, 1);
    }, [velocity]);
    const parallaxOffset = useMemo(() => {
        return scrollIntensity * 15;
    }, [scrollIntensity]);
    // Memoize theme-based styles
    const themeStyles = useMemo(() => {
        const baseStyles = {
            background: isDarkMode ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.95)',
            color: isDarkMode ? '#ffffff' : '#000000',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            cardBackground: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
        };
        // Add theme-specific accent colors
        const accentColors = {
            'classic-metal': isDarkMode ? '#ff6b35' : '#d32f2f',
            'black-metal': isDarkMode ? '#c0c0c0' : '#666666',
            'death-metal': isDarkMode ? '#8b0000' : '#d32f2f',
            'power-metal': isDarkMode ? '#ffd700' : '#f57c00',
            'doom-metal': isDarkMode ? '#8b0000' : '#d32f2f',
            'thrash-metal': isDarkMode ? '#ff4500' : '#e65100',
            'gothic-metal': isDarkMode ? '#800080' : '#7b1fa2',
            'light-mode': isDarkMode ? '#2196f3' : '#1976d2',
            'dark-mode': isDarkMode ? '#424242' : '#757575',
            'glassmorphism-premium': isDarkMode ? '#00bcd4' : '#0097a7',
            'neon-punk': isDarkMode ? '#00ff88' : '#00c853',
            'cyber-goth': isDarkMode ? '#ff00ff' : '#9c27b0',
            'industrial': isDarkMode ? '#ffd700' : '#f57c00',
            'doom': isDarkMode ? '#8b0000' : '#d32f2f'
        };
        return {
            ...baseStyles,
            accentColor: accentColors[currentTheme] || accentColors['classic-metal']
        };
    }, [currentTheme, isDarkMode]);
    // Memoize subscription plans to prevent unnecessary re-renders
    const subscriptionPlans = useMemo(() => [
        {
            id: 'basic',
            name: 'Basic Metalhead',
            price: '$4.99',
            period: 'month',
            features: [
                'Ad-free listening experience',
                'High-quality audio streams',
                'Access to basic playlists',
                'Community chat access'
            ],
            popular: false
        },
        {
            id: 'premium',
            name: 'Premium Rebel',
            price: '$9.99',
            period: 'month',
            features: [
                'Everything in Basic',
                'Exclusive metal content',
                'Priority customer support',
                'Early access to new features',
                'Custom playlist creation'
            ],
            popular: true
        },
        {
            id: 'legend',
            name: 'Legend Package',
            price: '$19.99',
            period: 'month',
            features: [
                'Everything in Premium',
                'VIP community access',
                'Exclusive merchandise discounts',
                'Direct artist interaction',
                'Behind-the-scenes content'
            ],
            popular: false
        }
    ], []);
    // Memoize the render function for subscription plans
    const renderSubscriptionPlan = useCallback((plan) => (_jsxs("div", { className: `relative p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${selectedPlan === plan.id ? 'ring-4 ring-opacity-50' : ''}`, style: {
            background: plan.id === selectedPlan ? themeStyles.cardBackground : themeStyles.background,
            borderColor: plan.id === selectedPlan ? themeStyles.accentColor : themeStyles.borderColor,
            transform: `translateY(${parallaxOffset}px)`
        }, onClick: () => setSelectedPlan(plan.id), children: [plan.popular && (_jsx("div", { className: "absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold", style: {
                    background: themeStyles.accentColor,
                    color: isDarkMode ? '#000000' : '#ffffff'
                }, children: "Most Popular" })), _jsx("h3", { className: "text-2xl font-bold mb-2", style: { color: themeStyles.color }, children: plan.name }), _jsxs("div", { className: "mb-4", children: [_jsx("span", { className: "text-4xl font-bold", style: { color: themeStyles.accentColor }, children: plan.price }), _jsxs("span", { className: "text-lg", style: { color: themeStyles.color }, children: ["/", plan.period] })] }), _jsx("ul", { className: "space-y-2 mb-6", children: plan.features.map((feature, index) => (_jsxs("li", { className: "flex items-center", children: [_jsx("span", { className: "mr-2 text-lg", style: { color: themeStyles.accentColor }, children: "\u2713" }), _jsx("span", { style: { color: themeStyles.color }, children: feature })] }, index))) }), _jsx("button", { className: `w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-0 ${plan.id === selectedPlan
                    ? 'scale-105 shadow-lg'
                    : 'hover:scale-102'}`, style: {
                    background: plan.id === selectedPlan ? themeStyles.accentColor : themeStyles.borderColor,
                    color: plan.id === selectedPlan
                        ? (isDarkMode ? '#000000' : '#ffffff')
                        : themeStyles.color
                }, children: plan.id === selectedPlan ? 'Selected' : 'Choose Plan' })] }, plan.id)), [selectedPlan, themeStyles, parallaxOffset, isDarkMode]);
    return (_jsx("section", { ref: ref, className: "py-16 px-4 min-h-screen flex items-center justify-center", style: {
            background: `linear-gradient(135deg, ${themeStyles.background}, ${themeStyles.background}dd)`,
            transform: `translateY(${parallaxOffset}px)`
        }, children: _jsxs("div", { className: "max-w-6xl mx-auto text-center", children: [_jsx("h2", { className: "text-5xl md:text-7xl font-bold mb-8", style: { color: themeStyles.accentColor }, children: "Choose Your Metal Path" }), _jsx("p", { className: "text-xl mb-12 max-w-3xl mx-auto", style: { color: themeStyles.color }, children: "Join the Spandex Salvation Radio family and unlock the ultimate metal experience. Choose the plan that fits your metal lifestyle." }), _jsx("div", { className: "grid md:grid-cols-3 gap-8 mb-12", children: subscriptionPlans.map(renderSubscriptionPlan) }), _jsxs("div", { className: "p-8 rounded-xl border backdrop-blur-md transition-all duration-500 hover:scale-105", style: {
                        background: themeStyles.cardBackground,
                        borderColor: themeStyles.borderColor,
                        transform: `translateY(${parallaxOffset * 1.5}px)`
                    }, children: [_jsx("p", { className: "text-xl font-semibold mb-4", style: { color: themeStyles.accentColor }, children: "Ready to Rock?" }), _jsx("p", { className: "text-lg mb-6", style: { color: themeStyles.color }, children: "Start your metal journey today and never miss a beat of the heaviest music on the planet." }), _jsx("button", { className: "px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-0", style: {
                                background: themeStyles.accentColor,
                                color: isDarkMode ? '#000000' : '#ffffff'
                            }, children: "Get Started Now" })] })] }) }));
}
