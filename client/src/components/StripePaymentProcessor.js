import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements, } from "@stripe/react-stripe-js";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { CreditCard, Lock, Check } from "lucide-react";
import RebelPackageIcon from "/RebelPackageIcon.png";
import LegendPackageIcon from "/LegendPackageIcon.png";
import IconPackageIcon from "/IconPackageIcon.png";
// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");
const subscriptionTiers = [
    {
        id: "rebel",
        name: "REBEL",
        price: 5.99,
        priceId: "price_rebel_monthly",
        icon: RebelPackageIcon,
        gradientStart: "#B56BFF",
        gradientEnd: "#FF50C3",
        features: [
            "Ad-free streaming experience",
            "High-quality audio (320kbps)",
            "Monthly exclusive playlist",
            "Priority song requests",
        ],
    },
    {
        id: "legend",
        name: "LEGEND",
        price: 12.99,
        priceId: "price_legend_monthly",
        popular: true,
        icon: LegendPackageIcon,
        gradientStart: "#E520C6",
        gradientEnd: "#F4654F",
        features: [
            "Everything in Rebel tier",
            "Exclusive live show access",
            "Artist interview archives",
            "VIP Discord community",
            "Monthly exclusive merch discount",
        ],
    },
    {
        id: "icon",
        name: "ICON",
        price: 24.99,
        priceId: "price_icon_monthly",
        icon: IconPackageIcon,
        gradientStart: "#FF50C3",
        gradientEnd: "#B66BFF",
        features: [
            "Everything in Legend tier",
            "Personal DJ requests",
            "Exclusive artist meet & greets",
            "Limited edition vinyl access",
            "Co-host opportunities",
        ],
    },
];
function PaymentForm({ selectedTier, onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const [processing, setProcessing] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({
        email: "",
        name: "",
    });
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) {
            return;
        }
        setProcessing(true);
        try {
            // Create subscription with backend
            const response = await apiRequest("POST", "/api/create-subscription", {
                priceId: selectedTier.priceId,
                customerEmail: customerInfo.email,
                customerName: customerInfo.name,
            });
            const { clientSecret } = await response.json();
            // Confirm payment with Stripe
            const { error } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: customerInfo.name,
                        email: customerInfo.email,
                    },
                },
            });
            if (error) {
                toast({
                    title: "Payment Failed",
                    description: error.message,
                    variant: "destructive",
                });
            }
            else {
                toast({
                    title: "Subscription Successful!",
                    description: `Welcome to ${selectedTier.name} tier! Your subscription is now active.`,
                });
                onSuccess();
            }
        }
        catch (error) {
            toast({
                title: "Subscription Error",
                description: "Unable to process subscription. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setProcessing(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "name", className: "text-gray-300 font-semibold", children: "Full Name *" }), _jsx(Input, { id: "name", value: customerInfo.name, onChange: (e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value })), placeholder: "John Doe", required: true, className: "bg-dark-bg/50 text-white placeholder-gray-400/60 2  50" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "email", className: "text-gray-300 font-semibold", children: "Email Address *" }), _jsx(Input, { id: "email", type: "email", value: customerInfo.email, onChange: (e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value })), placeholder: "john@example.com", required: true, className: "bg-dark-bg/50 text-white placeholder-gray-400/60 2  50" })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-gray-300 font-semibold", children: "Payment Information *" }), _jsx("div", { className: "mt-2 p-4 bg-dark-bg/50 rounded-lg", children: _jsx(CardElement, { options: {
                                style: {
                                    base: {
                                        color: "#ffffff",
                                        fontFamily: '"Inter", sans-serif',
                                        fontSmoothing: "antialiased",
                                        fontSize: "16px",
                                        "::placeholder": {
                                            color: "#9ca3af",
                                        },
                                    },
                                    invalid: {
                                        color: "#ef4444",
                                        iconColor: "#ef4444",
                                    },
                                },
                            } }) })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-dark-surface/50 rounded-lg", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-black text-white", children: ["Total: $", selectedTier.price, "/month"] }), _jsx("p", { className: "text-gray-400 text-sm font-semibold", children: "Billed monthly, cancel anytime" })] }), _jsxs("div", { className: "flex items-center text-gray-400", children: [_jsx(Lock, { className: "h-4 w-4 mr-1" }), _jsx("span", { className: "text-xs font-semibold", children: "Secure Payment" })] })] }), _jsxs(Button, { type: "submit", disabled: !stripe || processing, className: "w-full bg-metal-orange hover:bg-orange-600 text-white px-6 py-3 rounded-full font-bold transition-all duration-300", children: [_jsx(CreditCard, { className: "mr-2 h-4 w-4" }), processing ? "Processing..." : `Subscribe to ${selectedTier.name}`] })] }));
}
export default function StripePaymentProcessor() {
    const [selectedTier, setSelectedTier] = useState(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const handleTierSelect = (tier) => {
        setSelectedTier(tier);
        setShowPaymentForm(true);
    };
    const handlePaymentSuccess = () => {
        setShowPaymentForm(false);
        setSelectedTier(null);
    };
    if (showPaymentForm && selectedTier) {
        return (_jsx("div", { className: "max-w-2xl mx-auto", children: _jsx(Card, { className: "bg-dark-bg/50 hover:bg-dark-bg/70 transition-all duration-300", children: _jsxs(CardContent, { className: "p-8", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h3", { className: "font-black text-2xl text-white mb-2", children: "Complete Your Subscription" }), _jsxs("p", { className: "text-gray-400 font-semibold", children: ["You're subscribing to", " ", _jsx("span", { className: "text-metal-orange font-bold", children: selectedTier.name }), " ", "tier"] })] }), _jsx(Elements, { stripe: stripePromise, children: _jsx(PaymentForm, { selectedTier: selectedTier, onSuccess: handlePaymentSuccess }) }), _jsx(Button, { variant: "ghost", onClick: () => setShowPaymentForm(false), className: "w-full mt-4 text-gray-400 hover:text-white", children: "Back to Plans" })] }) }) }));
    }
    return (_jsxs("div", { className: "w-full", children: [_jsx("div", { className: "md:hidden w-full", children: _jsx("div", { className: "flex flex-col gap-8 max-w-sm mx-auto", children: (subscriptionTiers || []).map((tier) => (_jsxs("div", { className: "relative", children: [_jsx("h3", { className: "font-black text-white mb-4 text-center", style: {
                                    fontSize: tier.name === "LEGEND" ? "1.75rem" : "1.25rem" // 28px for LEGEND (20px + 8px), 20px for others
                                }, children: tier.name }), _jsxs("div", { className: "bg-transparent transition-all duration-300 relative rounded-lg flex flex-col", style: {
                                    minHeight: "540px", // Same height for all tiers
                                    border: `${tier.name === "LEGEND" ? "6px" : "5px"} solid ${tier.gradientStart}`, // Fixed: Use gradient color instead of transparent
                                    background: `linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(90deg, ${tier.gradientStart}, ${tier.gradientEnd}) border-box`,
                                    boxShadow: tier.name === "LEGEND"
                                        ? `0 0 30px ${tier.gradientStart}60, 0 0 60px ${tier.gradientEnd}40, inset 0 0 20px ${tier.gradientStart}20`
                                        : `0 8px 32px ${tier.gradientStart}20`,
                                }, children: [tier.popular && (_jsx("div", { className: "absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2", style: { top: "0" }, children: _jsx("span", { className: "px-4 py-1 rounded-full text-xs font-bold", style: {
                                                background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                                                color: "black",
                                                whiteSpace: "nowrap",
                                            }, children: "MOST\u00A0POPULAR" }) })), _jsxs("div", { className: "p-6 flex flex-col h-full justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx("img", { src: tier.icon, alt: `${tier.name} package icon`, className: `object-contain ${tier.id === "rebel" ? "w-20 h-20" : "w-16 h-16"}` }) }), _jsxs("div", { className: "mb-4", children: [_jsxs("span", { className: "text-3xl font-black text-metal-orange", children: ["$", tier.price] }), _jsx("span", { className: "text-gray-400 font-semibold", children: "/month" })] })] }), _jsx("ul", { className: "space-y-4 mb-12 flex-grow", children: (tier.features || []).map((feature, index) => (_jsx("li", { className: "flex items-start justify-center", children: _jsxs("div", { className: "flex items-start max-w-xs", children: [_jsx(Check, { className: "text-metal-orange h-6 w-6 mr-3 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-gray-300 font-semibold text-base leading-relaxed", children: feature })] }) }, index))) })] }), _jsx("button", { onClick: () => handleTierSelect(tier), className: "w-full font-bold rounded-full transition-all duration-300 text-white transform hover:scale-105 hover:shadow-2xl py-3 text-base focus:outline-none focus:ring-0", style: {
                                                    fontSize: "16px",
                                                    background: `linear-gradient(90deg, ${tier.gradientStart}, ${tier.gradientEnd})`,
                                                    boxShadow: `0 4px 15px ${tier.gradientStart}40`,
                                                }, onMouseEnter: (e) => {
                                                    e.currentTarget.style.boxShadow = `0 8px 25px ${tier.gradientStart}80, 0 0 10px ${tier.gradientEnd}60`;
                                                    e.currentTarget.style.transform = "scale(1.1)";
                                                }, onMouseLeave: (e) => {
                                                    e.currentTarget.style.boxShadow = `0 4px 15px ${tier.gradientStart}40`;
                                                    e.currentTarget.style.transform = "scale(1)";
                                                }, children: "Subscribe" })] })] })] }, `mobile-${tier.id}`))) }) }), _jsx("div", { className: "hidden md:block relative mx-auto", style: {
                    width: "100%",
                    maxWidth: "1000px",
                    height: "600px"
                }, children: (subscriptionTiers || []).map((tier, index) => (_jsxs("div", { className: "absolute transition-all duration-300", style: {
                        width: "340px", // All packages same width
                        left: index === 0
                            ? "calc(50% - 505px)" // Rebel: only 5px overlap (340 - 5 + 170)
                            : index === 1
                                ? "calc(50% - 170px)" // Legend: center (340px width / 2)
                                : "calc(50% + 165px)", // Icon: only 5px overlap (170 - 5)
                        top: index === 1 ? "40px" : "40px", // All packages at same height
                        zIndex: index === 1 ? 50 : 10,
                        transform: "none" // Remove scale transform
                    }, children: [_jsx("h3", { className: "font-black text-white mb-4 text-center", style: {
                                fontSize: tier.name === "LEGEND" ? "1.75rem" : "1.25rem"
                            }, children: tier.name }), tier.popular && (_jsx("div", { className: "absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2", style: {
                                background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                                color: "black",
                                whiteSpace: "nowrap",
                                fontSize: "11px",
                                lineHeight: "1",
                                zIndex: 100,
                                top: "53px", // Position exactly on the top border of card (after title)
                                padding: "4px 16px",
                                borderRadius: "9999px",
                                fontWeight: "bold"
                            }, children: "MOST\u00A0POPULAR" })), _jsxs("div", { className: "rounded-lg flex flex-col transition-all duration-300 relative overflow-hidden", style: {
                                height: "540px", // All packages same height
                                border: tier.popular ? `6px solid ${tier.gradientStart}` : `5px solid ${tier.gradientStart}`,
                                background: tier.popular
                                    ? `linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(90deg, #E520C6, #F4654F) border-box`
                                    : `linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(90deg, ${tier.gradientStart}, ${tier.gradientEnd}) border-box`,
                                boxShadow: tier.popular
                                    ? "0 0 30px #E520C6, 0 0 60px #F4654F, inset 0 0 20px rgba(229, 32, 198, 0.3)"
                                    : `0 0 15px ${tier.gradientStart}40`,
                                animation: tier.popular ? "legend-glow 4s linear infinite" : "none"
                            }, children: [tier.popular && (_jsx(_Fragment, { children: _jsx("div", { className: "absolute", style: {
                                            top: "-6px",
                                            left: "-6px",
                                            right: "-6px",
                                            bottom: "-6px",
                                            background: "linear-gradient(45deg, #ff6b35, #f7931e, #ffcc00, #f7931e, #ff6b35)",
                                            backgroundSize: "400% 400%",
                                            animation: "gradient-rotate 4s linear infinite",
                                            zIndex: -1,
                                            borderRadius: "inherit"
                                        } }) })), _jsxs("div", { className: "p-6 flex flex-col h-full justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx("img", { src: tier.icon, alt: `${tier.name} package icon`, className: `object-contain ${tier.id === "rebel" ? "w-20 h-20" : "w-16 h-16"}` }) }), _jsxs("div", { className: "mb-4", children: [_jsxs("span", { className: "text-3xl font-black text-metal-orange", children: ["$", tier.price] }), _jsx("span", { className: "text-gray-400 font-semibold", children: "/month" })] })] }), _jsx("ul", { className: "space-y-4 mb-12 flex-grow px-6", children: (tier.features || []).map((feature, index) => (_jsxs("li", { className: "flex items-start", children: [_jsx(Check, { className: "text-metal-orange h-6 w-6 mr-3 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-gray-300 font-semibold text-base leading-relaxed", children: feature })] }, index))) })] }), _jsx("button", { onClick: () => handleTierSelect(tier), className: "w-full font-bold rounded-full transition-all duration-300 text-white transform hover:scale-105 hover:shadow-2xl py-3 text-base focus:outline-none focus:ring-0", style: {
                                                fontSize: "16px",
                                                background: `linear-gradient(90deg, ${tier.gradientStart}, ${tier.gradientEnd})`,
                                                boxShadow: `0 4px 15px ${tier.gradientStart}40`,
                                            }, onMouseEnter: (e) => {
                                                e.currentTarget.style.boxShadow = `0 8px 25px ${tier.gradientStart}80, 0 0 10px ${tier.gradientEnd}60`;
                                                e.currentTarget.style.transform = "scale(1.1)";
                                            }, onMouseLeave: (e) => {
                                                e.currentTarget.style.boxShadow = `0 4px 15px ${tier.gradientStart}40`;
                                                e.currentTarget.style.transform = "scale(1)";
                                            }, children: "Subscribe" })] })] })] }, `desktop-${tier.id}`))) })] }));
}
