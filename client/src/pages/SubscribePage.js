import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Check, Crown, Music, MessageCircle, Star, ArrowLeft, } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { Link } from "wouter";
import { cn } from "../lib/utils";
const subscriptionTiers = [
    {
        id: "rebel",
        name: "Rebel",
        price: 4.99,
        popular: false,
        features: [
            "Ad-free streaming",
            "High-quality audio",
            "Basic song requests",
            "Mobile app access",
        ],
    },
    {
        id: "legend",
        name: "Legend",
        price: 9.99,
        popular: true,
        features: [
            "Everything in Rebel",
            "Live chat access",
            "Priority song requests",
            "Exclusive content",
            "Premium avatars",
            "Early show access",
        ],
    },
    {
        id: "icon",
        name: "Icon",
        price: 19.99,
        popular: false,
        features: [
            "Everything in Legend",
            "VIP chat privileges",
            "Direct DJ messaging",
            "Custom playlists",
            "Exclusive merchandise",
            "Meet & greet opportunities",
        ],
    },
];
export default function SubscribePage() {
    const [selectedTier, setSelectedTier] = useState("legend");
    const { getColors, theme } = useTheme();
    const colors = getColors();
    const handleSubscribe = (tierId) => {
        // Here you would integrate with Stripe or your payment processor
        console.log(`Subscribing to ${tierId} tier`);
        // For now, redirect to a placeholder
        window.location.href = `/api/subscribe/${tierId}`;
    };
    return (_jsx("div", { className: cn("min-h-screen p-4", theme === "light" ? "bg-white" : "bg-black"), children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "text-center space-y-4 mb-12", children: [_jsx("div", { className: "flex items-center justify-center space-x-4 mb-6", children: _jsx(Link, { href: "/", children: _jsxs(Button, { variant: "ghost", size: "sm", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Home"] }) }) }), _jsxs("h1", { className: "text-4xl font-black", children: ["Choose Your ", _jsx("span", { style: { color: colors.primary }, children: "Metal" }), " ", "Experience"] }), _jsx("p", { className: "text-xl text-muted-foreground max-w-2xl mx-auto", children: "Join the Spandex Salvation revolution and unlock exclusive features, premium content, and VIP access to the metal community." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 mb-12", children: subscriptionTiers.map((tier) => (_jsxs(Card, { className: cn("relative transition-all duration-300 hover:scale-105", selectedTier === tier.id && "ring-2", tier.popular && "border-2"), style: {
                            '--ring-color': selectedTier === tier.id ? colors.primary : undefined,
                            borderColor: tier.popular ? colors.primary : undefined,
                        }, children: [tier.popular && (_jsx("div", { className: "absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-bold", style: { backgroundColor: colors.primary }, children: "MOST POPULAR" })), _jsx(CardHeader, { className: "text-center space-y-4", children: _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-2xl font-bold", children: tier.name }), _jsxs("div", { className: "flex items-center justify-center space-x-1", children: [_jsxs("span", { className: "text-4xl font-black", children: ["$", tier.price] }), _jsx("span", { className: "text-muted-foreground", children: "/month" })] })] }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsx("ul", { className: "space-y-3", children: tier.features.map((feature, index) => (_jsxs("li", { className: "flex items-center space-x-3", children: [_jsx(Check, { className: "h-5 w-5 flex-shrink-0", style: { color: colors.primary } }), _jsx("span", { className: "text-sm", children: feature })] }, index))) }), _jsx(Button, { className: "w-full", variant: tier.popular ? "default" : "outline", onClick: () => handleSubscribe(tier.id), style: tier.popular
                                            ? { backgroundColor: colors.primary }
                                            : undefined, children: tier.popular ? "Get Started" : "Choose Plan" })] })] }, tier.id))) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12", children: [_jsxs(Card, { className: "text-center p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 cursor-pointer", style: {
                                backgroundColor: colors.surface,
                                borderColor: `${colors.primary}80`,
                                boxShadow: `0 8px 32px ${colors.primary}20`,
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.borderColor = colors.primary;
                                e.currentTarget.style.boxShadow = `0 15px 50px ${colors.primary}60`;
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.borderColor = `${colors.primary}80`;
                                e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}20`;
                            }, children: [_jsx(Music, { className: "h-12 w-12 mx-auto mb-4", style: { color: colors.primary } }), _jsx("h3", { className: "font-bold mb-2", style: { color: colors.text }, children: "Premium Audio" }), _jsx("p", { className: "text-sm", style: { color: colors.textMuted }, children: "High-quality streaming with zero ads" })] }), _jsxs(Card, { className: "text-center p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 cursor-pointer", style: {
                                backgroundColor: colors.surface,
                                borderColor: `${colors.primary}80`,
                                boxShadow: `0 8px 32px ${colors.primary}20`,
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.borderColor = colors.primary;
                                e.currentTarget.style.boxShadow = `0 15px 50px ${colors.primary}60`;
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.borderColor = `${colors.primary}80`;
                                e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}20`;
                            }, children: [_jsx(MessageCircle, { className: "h-12 w-12 mx-auto mb-4", style: { color: colors.primary } }), _jsx("h3", { className: "font-bold mb-2", style: { color: colors.text }, children: "Live Chat" }), _jsx("p", { className: "text-sm", style: { color: colors.textMuted }, children: "Connect with the metal community" })] }), _jsxs(Card, { className: "text-center p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 cursor-pointer", style: {
                                backgroundColor: colors.surface,
                                borderColor: `${colors.primary}80`,
                                boxShadow: `0 8px 32px ${colors.primary}20`,
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.borderColor = colors.primary;
                                e.currentTarget.style.boxShadow = `0 15px 50px ${colors.primary}60`;
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.borderColor = `${colors.primary}80`;
                                e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}20`;
                            }, children: [_jsx(Crown, { className: "h-12 w-12 mx-auto mb-4", style: { color: colors.primary } }), _jsx("h3", { className: "font-bold mb-2", style: { color: colors.text }, children: "Exclusive Content" }), _jsx("p", { className: "text-sm", style: { color: colors.textMuted }, children: "Access to special shows and interviews" })] }), _jsxs(Card, { className: "text-center p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 cursor-pointer", style: {
                                backgroundColor: colors.surface,
                                borderColor: `${colors.primary}80`,
                                boxShadow: `0 8px 32px ${colors.primary}20`,
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.borderColor = colors.primary;
                                e.currentTarget.style.boxShadow = `0 15px 50px ${colors.primary}60`;
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.borderColor = `${colors.primary}80`;
                                e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}20`;
                            }, children: [_jsx(Star, { className: "h-12 w-12 mx-auto mb-4", style: { color: colors.primary } }), _jsx("h3", { className: "font-bold mb-2", style: { color: colors.text }, children: "VIP Access" }), _jsx("p", { className: "text-sm", style: { color: colors.textMuted }, children: "Priority requests and early access" })] })] }), _jsxs(Card, { className: "mb-12", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-center", children: "Frequently Asked Questions" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Can I cancel anytime?" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "What payment methods do you accept?" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "We accept all major credit cards, PayPal, and other secure payment methods through Stripe." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Can I upgrade or downgrade my plan?" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Absolutely! You can change your subscription tier at any time from your profile settings." })] })] })] })] }) }));
}
