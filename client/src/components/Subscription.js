import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, VolumeX, Users, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "../components/ui/dialog";
import { useToast } from "../hooks/use-toast";
import { useTheme } from "../contexts/ThemeContext";
const subscriptionTiers = [
    {
        name: "REBEL",
        price: "$5.99",
        color: "metal-orange",
        popular: false,
        features: [
            "Ad-free streaming experience",
            "High-quality audio (320kbps)",
            "Monthly exclusive playlist",
            "Priority song requests",
        ],
    },
    {
        name: "LEGEND",
        price: "$12.99",
        color: "metal-gold",
        popular: true,
        features: [
            "Everything in Rebel tier",
            "Exclusive live show access",
            "Artist interview archives",
            "VIP Discord community",
            "Monthly exclusive merch discount",
        ],
    },
    {
        name: "ICON",
        price: "$24.99",
        color: "metal-red",
        popular: false,
        features: [
            "Everything in Legend tier",
            "One-on-one artist video calls",
            "Exclusive concert tickets",
            "Limited edition vinyl records",
            "Personal song dedications",
        ],
    },
];
export default function Subscription() {
    const [email, setEmail] = useState("");
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();
    const { colors } = useTheme();
    const subscribeMutation = useMutation({
        mutationFn: async (data) => {
            const response = await fetch("/api/subscriptions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error("Failed to subscribe");
            }
            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Subscription Successful!",
                description: "Welcome to the Spandex Salvation family! 🤘",
            });
            setEmail("");
            setIsDialogOpen(false);
        },
        onError: () => {
            toast({
                title: "Subscription Failed",
                description: "Please try again or contact support.",
                variant: "destructive",
            });
        },
    });
    const handleSubscribe = (plan) => {
        setSelectedPlan(plan);
        setIsDialogOpen(true);
    };
    const handleConfirmSubscription = (e) => {
        e.preventDefault();
        if (!selectedPlan || !email)
            return;
        subscribeMutation.mutate({
            userID: "temp-user-id", // TODO: Get actual user ID
            packageType: selectedPlan,
            amount: 0, // TODO: Get actual amount
            currency: "USD",
            status: "active",
            startDate: new Date(),
            endDate: new Date(),
        });
    };
    return (_jsxs("section", { id: "subscribe", className: "py-20 bg-dark-surface", children: [_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h2", { className: "font-orbitron font-bold text-3xl md:text-4xl mb-4 text-black dark:text-white", children: "JOIN THE HAIRSPRAY REBELLION" }), _jsx("p", { className: "text-gray-400 text-lg max-w-2xl mx-auto", children: "Support the station and unlock exclusive content." })] }), _jsx("div", { className: "md:hidden flex flex-col gap-8 max-w-sm mx-auto", children: subscriptionTiers.map((tier, index) => (_jsxs("div", { children: [_jsx("h3", { className: `font-black text-white mb-4 text-center ${tier.color === "metal-gold"
                                        ? "text-metal-gold"
                                        : tier.color === "metal-red"
                                            ? "text-metal-red"
                                            : "text-white"}`, style: { fontSize: "1.25rem" }, children: tier.name }), _jsxs("div", { className: "rounded-lg flex flex-col transition-all duration-300 relative", style: {
                                        minHeight: "540px",
                                        border: tier.popular ? "3px solid #B56BFF" : "2px solid #374151",
                                        background: "rgba(31, 41, 55, 0.95)",
                                        boxShadow: tier.popular
                                            ? "0 0 20px #B56BFF, inset 0 0 20px rgba(181, 107, 255, 0.2)"
                                            : "none",
                                        animation: tier.popular ? "legend-glow 4s linear infinite" : "none"
                                    }, children: [tier.popular && (_jsx("div", { className: "absolute left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold", style: {
                                                top: "-12px", // Centered over top border
                                                background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                                                color: "black",
                                                whiteSpace: "nowrap",
                                                fontSize: "11px",
                                                lineHeight: "1",
                                                zIndex: 10
                                            }, children: "MOST\u00A0POPULAR" })), _jsxs("div", { className: "p-8 flex flex-col h-full justify-between", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: `text-3xl font-bold mb-1 ${tier.color === "metal-gold"
                                                                ? "text-metal-gold"
                                                                : tier.color === "metal-red"
                                                                    ? "text-metal-red"
                                                                    : "text-metal-orange"}`, children: tier.price }), _jsx("div", { className: "text-gray-400 text-sm", children: "per month" })] }), _jsx("ul", { className: `space-y-3 ${tier.popular ? "mb-6" : "mb-8"} flex-grow`, children: tier.features.map((feature, featureIndex) => (_jsxs("li", { className: "flex items-center justify-center text-gray-300", children: [_jsx(Check, { className: "w-5 h-5 text-metal-orange mr-3 flex-shrink-0" }), _jsx("span", { className: "text-sm text-center", children: feature })] }, featureIndex))) }), _jsxs(Button, { onClick: () => handleSubscribe(tier.name), className: "w-full py-3 text-lg font-semibold", style: {
                                                        background: `linear-gradient(135deg, ${tier.color === "metal-gold"
                                                            ? "#f7931e, #ffcc00"
                                                            : tier.color === "metal-red"
                                                                ? "#dc2626, #ef4444"
                                                                : "#ff6b35, #f7931e"})`,
                                                        color: "white",
                                                        border: "none",
                                                    }, children: ["CHOOSE ", tier.name] })] })] })] }, `mobile-${tier.name}`))) }), _jsx("div", { className: "hidden md:block relative mx-auto", style: {
                            width: "100%",
                            maxWidth: "1000px",
                            height: "600px"
                        }, children: subscriptionTiers.map((tier, index) => (_jsxs("div", { className: "absolute transition-all duration-300", style: {
                                width: "320px",
                                left: index === 0
                                    ? "calc(50% - 325px)" // Rebel: moved further left, only 5px overlap
                                    : index === 1
                                        ? "calc(50% - 160px)" // Legend: center
                                        : "calc(50% + 5px)", // Icon: moved further right, only 5px overlap
                                top: index === 1 ? "20px" : "40px", // Legend higher than others
                                zIndex: index === 1 ? 50 : 10
                            }, children: [_jsx("h3", { className: `font-black text-white mb-4 text-center ${tier.color === "metal-gold"
                                        ? "text-metal-gold"
                                        : tier.color === "metal-red"
                                            ? "text-metal-red"
                                            : "text-white"}`, style: { fontSize: "1.25rem" }, children: tier.name }), _jsxs("div", { className: "rounded-lg flex flex-col transition-all duration-300 relative overflow-hidden", style: {
                                        minHeight: "540px",
                                        border: tier.popular ? "3px solid #B56BFF" : "2px solid #374151",
                                        background: "rgba(31, 41, 55, 0.95)",
                                        boxShadow: tier.popular
                                            ? "0 0 20px #B56BFF, inset 0 0 20px rgba(181, 107, 255, 0.2)"
                                            : "none",
                                        animation: tier.popular ? "legend-glow 4s linear infinite" : "none"
                                    }, children: [tier.popular && (_jsxs(_Fragment, { children: [_jsx("div", { className: "absolute left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold", style: {
                                                        top: "-12px", // Centered over top border
                                                        background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                                                        color: "black",
                                                        whiteSpace: "nowrap",
                                                        fontSize: "11px",
                                                        lineHeight: "1",
                                                        zIndex: 10
                                                    }, children: "MOST\u00A0POPULAR" }), _jsx("div", { className: "absolute", style: {
                                                        top: "-3px",
                                                        left: "-3px",
                                                        right: "-3px",
                                                        bottom: "-3px",
                                                        background: "linear-gradient(45deg, #B56BFF, #FF50C3, #FFD700, #FF6B35, #B56BFF)",
                                                        backgroundSize: "400% 400%",
                                                        animation: "gradient-rotate 4s linear infinite",
                                                        zIndex: -1,
                                                        borderRadius: "inherit"
                                                    } })] })), _jsxs("div", { className: "p-8 flex flex-col h-full justify-between", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: `text-3xl font-bold mb-1 ${tier.color === "metal-gold"
                                                                ? "text-metal-gold"
                                                                : tier.color === "metal-red"
                                                                    ? "text-metal-red"
                                                                    : "text-metal-orange"}`, children: tier.price }), _jsx("div", { className: "text-gray-400 text-sm", children: "per month" })] }), _jsx("ul", { className: `space-y-3 ${tier.popular ? "mb-6" : "mb-8"} flex-grow`, children: tier.features.map((feature, featureIndex) => (_jsxs("li", { className: "flex items-start text-gray-300", children: [_jsx(Check, { className: "w-5 h-5 text-metal-orange mr-3 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm", children: feature })] }, featureIndex))) }), _jsxs(Button, { onClick: () => handleSubscribe(tier.name), className: "w-full py-3 text-lg font-semibold", style: {
                                                        background: `linear-gradient(135deg, ${tier.color === "metal-gold"
                                                            ? "#f7931e, #ffcc00"
                                                            : tier.color === "metal-red"
                                                                ? "#dc2626, #ef4444"
                                                                : "#ff6b35, #f7931e"})`,
                                                        color: "white",
                                                        border: "none",
                                                    }, children: ["CHOOSE ", tier.name] })] })] })] }, `desktop-${tier.name}`))) }), _jsx("div", { className: "mb-16" }), _jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "font-bold text-2xl mb-8 text-white", children: "Why Subscribe?" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "w-16 h-16 bg-metal-orange/20 rounded-full flex items-center justify-center mb-4", children: _jsx(VolumeX, { className: "text-metal-orange h-8 w-8" }) }), _jsx("h4", { className: "font-semibold text-lg mb-2", children: "Premium Audio Quality" }), _jsx("p", { className: "text-gray-400 text-center", children: "Experience crystal-clear metal with our high-bitrate streaming." })] }), _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "w-16 h-16 bg-metal-gold/20 rounded-full flex items-center justify-center mb-4", children: _jsx(Users, { className: "text-metal-gold h-8 w-8" }) }), _jsx("h4", { className: "font-semibold text-lg mb-2", children: "Exclusive Community" }), _jsx("p", { className: "text-gray-400 text-center", children: "Connect with fellow metalheads in our VIP community spaces." })] }), _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "w-16 h-16 bg-metal-red/20 rounded-full flex items-center justify-center mb-4", children: _jsx(Star, { className: "text-metal-red h-8 w-8" }) }), _jsx("h4", { className: "font-semibold text-lg mb-2", children: "Exclusive Content" }), _jsx("p", { className: "text-gray-400 text-center", children: "Access rare tracks, interviews, and behind-the-scenes content." })] })] })] })] }), _jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: _jsxs(DialogContent, { className: "bg-dark-surface border-dark-border", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "text-white", children: ["Subscribe to ", selectedPlan, " Plan"] }) }), _jsxs("form", { onSubmit: handleConfirmSubscription, className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "email", className: "text-white", children: "Email Address" }), _jsx(Input, { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "Enter your email", className: "bg-dark-bg border-dark-border text-white", required: true })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: subscribeMutation.isPending, children: subscribeMutation.isPending ? "Processing..." : "Subscribe Now" })] })] }) })] }));
}
