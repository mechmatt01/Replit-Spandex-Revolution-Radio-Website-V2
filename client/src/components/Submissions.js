import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Crown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { useToast } from "../hooks/use-toast";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { apiRequest } from "../lib/queryClient";
import LiveChat from "../components/LiveChat";
export default function Submissions() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        songTitle: "",
        artist: "",
        genre: "",
        message: "",
        status: "pending",
    });
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { user, isAuthenticated } = useFirebaseAuth();
    const { getColors, currentTheme } = useTheme();
    const colors = getColors();
    const { data: recentSubmissions = [] } = useQuery({
        queryKey: ["/api/submissions"],
    });
    const submitMutation = useMutation({
        mutationFn: async (data) => {
            // Check for premium subscription before submission
            if (!isAuthenticated) {
                window.location.href = "/#/login";
                return;
            }
            if (!hasPaidSubscription) {
                setShowPremiumNotification(true);
                return;
            }
            const response = await apiRequest("POST", "/api/submissions", data);
            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Submission Successful!",
                description: "Your song request has been submitted for review.",
            });
            setFormData({
                name: "",
                email: "",
                songTitle: "",
                artist: "",
                genre: "",
                message: "",
                status: "pending",
            });
            setAgreedToTerms(false);
            queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
        },
        onError: () => {
            toast({
                title: "Submission Failed",
                description: "Please check your information and try again.",
                variant: "destructive",
            });
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!agreedToTerms) {
            toast({
                title: "Terms Required",
                description: "Please agree to the terms and conditions.",
                variant: "destructive",
            });
            return;
        }
        submitMutation.mutate(formData);
    };
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };
    // State for premium notification
    const [showPremiumNotification, setShowPremiumNotification] = useState(false);
    // Check if user has paid subscription (assuming stripeSubscriptionId indicates paid status)
    const hasPaidSubscription = user?.stripeSubscriptionId || false;
    return (_jsx("section", { id: "submissions", className: "py-20 transition-colors duration-300", style: { backgroundColor: colors.background }, children: _jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h2", { className: "font-orbitron font-bold text-3xl md:text-4xl mb-4", style: {
                                color: currentTheme === 'light-mode' ? '#000000' : colors.text
                            }, children: "SUBMIT YOUR REQUESTS" }), _jsx("p", { className: "text-lg", style: { color: colors.textMuted }, children: "Got a metal track that needs to be heard? Submit your requests and help shape our playlist." })] }), !isAuthenticated || !hasPaidSubscription ? (_jsx("div", { className: "mt-6", children: _jsxs("div", { className: "p-6 rounded-lg text-center transition-all duration-300 animate-in fade-in slide-in-from-top-4", style: {
                            backgroundColor: `${colors.primary}25`,
                            border: 'none',
                        }, children: [_jsxs("div", { className: "flex items-center justify-center gap-2 mb-4", style: { color: colors.primary }, children: [_jsx(Crown, { className: "h-5 w-5" }), _jsx("span", { className: "font-semibold", children: "Premium Feature - Paid Subscription Required" })] }), _jsx("p", { className: "mb-6", style: { color: colors.textMuted }, children: "Song submissions are available exclusively to paid subscribers. Sign in and upgrade to submit your favorite tracks." }), _jsxs("div", { className: "flex gap-4 justify-center", children: [_jsx(Button, { onClick: () => {
                                            // Trigger auth modal instead of redirect
                                            const event = new CustomEvent("openAuthModal", {
                                                detail: { mode: "login" },
                                            });
                                            window.dispatchEvent(event);
                                        }, className: "px-6 py-3 rounded-full font-semibold transition-all duration-300 border-0", style: {
                                            backgroundColor: colors.primary,
                                            color: colors.primaryText || "white",
                                        }, onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor =
                                                colors.primaryDark || colors.primary;
                                            e.currentTarget.style.transform = "scale(1.05)";
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = colors.primary;
                                            e.currentTarget.style.transform = "scale(1)";
                                        }, children: "Login" }), _jsx(Button, { onClick: () => document
                                            .getElementById("subscribe")
                                            ?.scrollIntoView({ behavior: "smooth" }), variant: "outline", className: "px-6 py-3 rounded-full font-semibold transition-all duration-300", style: {
                                            borderColor: colors.primary,
                                            color: colors.primary,
                                            backgroundColor: "transparent",
                                        }, onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = `${colors.primary}10`;
                                            e.currentTarget.style.transform = "scale(1.05)";
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = "transparent";
                                            e.currentTarget.style.transform = "scale(1)";
                                        }, children: "View Subscriptions" })] })] }) })) : (_jsx(Card, { className: "bg-dark-surface border-dark-border mb-12", children: _jsx(CardContent, { className: "p-8", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "songTitle", className: "text-gray-300 font-semibold", children: "Song Title *" }), _jsx(Input, { id: "songTitle", value: formData.songTitle, onChange: (e) => handleInputChange("songTitle", e.target.value), placeholder: "Enter song title", required: true, className: "bg-dark-bg border-dark-border text-white placeholder-gray-500 focus:border-primary" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "artist", className: "text-gray-300 font-semibold", children: "Artist/Band *" }), _jsx(Input, { id: "artist", value: formData.artist, onChange: (e) => handleInputChange("artist", e.target.value), placeholder: "Enter artist name", required: true, className: "bg-dark-bg border-dark-border text-white placeholder-gray-500 focus:border-primary" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "name", className: "text-gray-300 font-semibold", children: "Your Name" }), _jsx(Input, { id: "name", value: formData.name, onChange: (e) => handleInputChange("name", e.target.value), placeholder: "Enter your name", required: true, className: "bg-dark-bg border-dark-border text-white placeholder-gray-400/60 focus:border-primary" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "email", className: "text-gray-300 font-semibold", children: "Your Email" }), _jsx(Input, { id: "email", type: "email", value: formData.email, onChange: (e) => handleInputChange("email", e.target.value), placeholder: "Enter your email", required: true, className: "bg-dark-bg border-dark-border text-white placeholder-gray-400/60 focus:border-primary" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "message", className: "text-gray-300 font-semibold", children: "Additional Message" }), _jsx(Textarea, { id: "message", value: formData.message || "", onChange: (e) => handleInputChange("message", e.target.value), placeholder: "Tell us why this song rocks or share any additional details...", rows: 4, className: "bg-dark-bg border-dark-border text-white placeholder-gray-400/60 focus:border-primary resize-none" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "terms", checked: agreedToTerms, onCheckedChange: (checked) => setAgreedToTerms(checked === true), className: "border-dark-border" }), _jsx(Label, { htmlFor: "terms", className: "text-gray-400 text-sm", children: "I agree that this submission follows metal music guidelines and community standards." })] }), _jsxs(Button, { type: "submit", disabled: submitMutation.isPending, className: "w-full md:w-auto bg-metal-orange hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 animate-glow focus:outline-none focus:ring-0", children: [_jsx(Send, { className: "mr-2 h-4 w-4" }), submitMutation.isPending
                                            ? "SUBMITTING..."
                                            : "SUBMIT REQUEST"] })] }) }) })), (recentSubmissions || []).length > 0 &&
                    isAuthenticated &&
                    hasPaidSubscription && (_jsxs("div", { className: "mt-16", children: [_jsx("h3", { className: "font-bold text-xl mb-6", style: { color: "var(--color-primary)" }, children: "Recent Submissions" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: (recentSubmissions || []).slice(0, 4).map((submission) => (_jsx(Card, { className: "bg-dark-surface border-dark-border", children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold", children: submission.songTitle }), _jsx("p", { className: "text-gray-400 text-sm", children: submission.artistName })] }), _jsx("span", { className: `text-xs px-2 py-1 rounded ${submission.status === "approved"
                                                        ? "text-metal-orange bg-metal-orange/20"
                                                        : submission.status === "rejected"
                                                            ? "text-metal-red bg-metal-red/20"
                                                            : "text-metal-gold bg-metal-gold/20"}`, children: submission.status === "approved"
                                                        ? "Approved"
                                                        : submission.status === "rejected"
                                                            ? "Rejected"
                                                            : "Pending" })] }), _jsx("p", { className: "text-gray-500 text-xs", children: submission.submitterName
                                                ? `Submitted by: ${submission.submitterName}`
                                                : "Anonymous" }), _jsx("p", { className: "text-gray-500 text-xs", children: submission.createdAt
                                                ? formatDate(submission.createdAt)
                                                : "Recently" })] }) }, submission.id))) })] })), showPremiumNotification && (_jsx(LiveChat, { isEnabled: true, onToggle: () => setShowPremiumNotification(false) }))] }) }));
}
