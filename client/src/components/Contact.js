import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Check, X, Copy, } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { useTheme } from "../contexts/ThemeContext";
export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [validationErrors, setValidationErrors] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [originalMessage, setOriginalMessage] = useState("");
    const { toast } = useToast();
    const { getColors, currentTheme } = useTheme();
    const colors = getColors();
    const contactMutation = useMutation({
        mutationFn: async (data) => {
            const response = await apiRequest("POST", "/api/contacts", data);
            return response.json();
        },
        onSuccess: () => {
            setOriginalMessage(formData.message);
            setShowSuccess(true);
            setFormData({
                name: "",
                email: "",
                message: "",
            });
            setValidationErrors([]);
        },
        onError: () => {
            setOriginalMessage(formData.message);
            setShowError(true);
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        // Validate form
        const errors = [];
        if (!formData.name.trim())
            errors.push("Name");
        if (!formData.email.trim())
            errors.push("Email Address");
        if (!formData.message.trim())
            errors.push("Message");
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            errors.push("Please enter a valid email address");
        }
        if ((errors?.length || 0) > 0) {
            setValidationErrors(errors);
            return;
        }
        setValidationErrors([]);
        contactMutation.mutate(formData);
    };
    const handleCopyMessage = () => {
        if (originalMessage) {
            navigator.clipboard.writeText(originalMessage);
            toast({
                title: "Message Copied",
                description: "Your message has been copied to clipboard.",
            });
        }
    };
    const handleTryAgain = () => {
        setShowError(false);
        setShowSuccess(false);
    };
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };
    return (_jsx("section", { id: "contact", className: "py-20 transition-colors duration-300", style: { backgroundColor: colors.background }, children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h2", { className: "font-orbitron font-black text-3xl md:text-4xl mb-4", style: {
                                color: currentTheme === 'light-mode' ? '#000000' : colors.text
                            }, children: "GET IN TOUCH" }), _jsx("p", { className: "text-lg font-semibold", style: { color: colors.textMuted }, children: "Have questions, feedback, or want to get involved? Drop us a line!" })] }), _jsx("div", { className: "flex justify-center items-center min-h-[500px]", children: _jsx("div", { className: "w-full max-w-lg", children: _jsx(Card, { className: "transition-all duration-300 mx-auto border-0", style: {
                                backgroundColor: colors.card
                            }, children: _jsxs(CardContent, { className: "p-8", children: [!showSuccess && !showError && (_jsxs(_Fragment, { children: [_jsx("h3", { className: "font-black text-xl mb-6 text-center", style: { color: colors.primary }, children: "Send us a Message" }), (validationErrors?.length || 0) > 0 && (_jsxs("div", { className: "mb-4 p-3 bg-red-900/20 border border-red-500 rounded-md", children: [_jsx("p", { className: "text-red-400 text-sm font-semibold", children: "Please fill out the following required fields:" }), _jsx("ul", { className: "text-red-300 text-sm mt-1", children: validationErrors.map((field, index) => (_jsxs("li", { children: ["\u2022 ", field] }, index))) })] })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsxs(Label, { htmlFor: "name", className: "font-semibold", style: { color: colors.textSecondary }, children: ["Full Name", validationErrors.includes("Name") && _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "name", value: formData.name, onChange: (e) => handleInputChange("name", e.target.value), placeholder: "John Doe", required: true, className: "transition-colors duration-300 placeholder:text-gray-400 placeholder:opacity-50", style: {
                                                                    backgroundColor: colors.surface,
                                                                    border: 'none',
                                                                    color: colors.text
                                                                } })] }), _jsxs("div", { children: [_jsxs(Label, { htmlFor: "email", className: "font-semibold", style: { color: colors.textSecondary }, children: ["Email Address", validationErrors.includes("Email Address") && _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { id: "email", type: "email", value: formData.email, onChange: (e) => handleInputChange("email", e.target.value), placeholder: "john@example.com", required: true, className: "transition-colors duration-300 placeholder:text-gray-400 placeholder:opacity-50", style: {
                                                                    backgroundColor: colors.surface,
                                                                    border: 'none',
                                                                    color: colors.text
                                                                } })] }), _jsxs("div", { children: [_jsxs(Label, { htmlFor: "contactMessage", className: "font-semibold", style: { color: colors.textSecondary }, children: ["Message", validationErrors.includes("Message") && _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Textarea, { id: "contactMessage", value: formData.message, onChange: (e) => handleInputChange("message", e.target.value), placeholder: "Tell us what's on your mind...", rows: 5, required: true, className: "resize-none transition-colors duration-300 placeholder:text-gray-400 placeholder:opacity-50", style: {
                                                                    backgroundColor: colors.surface,
                                                                    border: 'none',
                                                                    color: colors.text
                                                                } })] }), _jsxs(Button, { type: "submit", disabled: contactMutation.isPending, className: "w-full px-6 py-3 rounded-full font-bold transition-all duration-300 focus:outline-none focus:ring-0", style: {
                                                            backgroundColor: colors.primary,
                                                            color: colors.primaryText || "white",
                                                        }, onMouseEnter: (e) => {
                                                            e.currentTarget.style.backgroundColor =
                                                                colors.primaryDark || colors.primary;
                                                            e.currentTarget.style.transform = "scale(1.02)";
                                                        }, onMouseLeave: (e) => {
                                                            e.currentTarget.style.backgroundColor =
                                                                colors.primary;
                                                            e.currentTarget.style.transform = "scale(1)";
                                                        }, children: [_jsx(Send, { className: "mr-2 h-4 w-4" }), contactMutation.isPending
                                                                ? "SENDING..."
                                                                : "SEND MESSAGE"] })] })] })), showSuccess && (_jsxs("div", { className: "text-center animate-in fade-in duration-500", children: [_jsxs("div", { className: "relative inline-flex items-center justify-center mb-4", children: [_jsx("div", { className: "absolute w-16 h-16 rounded-full opacity-50", style: { backgroundColor: colors.primary } }), _jsx(Check, { className: "w-8 h-8 text-green-400 relative z-10" })] }), _jsx("h3", { className: "font-black text-xl mb-2 text-green-400", children: "Message Sent Successfully!" }), _jsx("p", { className: "text-gray-300 text-sm", children: "We'll get back to you within 24-48 hours." }), _jsx(Button, { onClick: handleTryAgain, className: "mt-4 px-6 py-2 rounded-full font-bold transition-all duration-300 focus:outline-none focus:ring-0", style: {
                                                    backgroundColor: colors.primary,
                                                    color: colors.primaryText || "white",
                                                }, children: "Send Another Message" })] })), showError && (_jsxs("div", { className: "text-center animate-in fade-in duration-500", children: [_jsxs("div", { className: "relative inline-flex items-center justify-center mb-4", children: [_jsx("div", { className: "absolute w-16 h-16 rounded-full bg-red-600 opacity-50" }), _jsx(X, { className: "w-8 h-8 text-red-400 relative z-10" })] }), _jsx("h3", { className: "font-black text-xl mb-2 text-red-400", children: "Message Failed to Send" }), _jsx("p", { className: "text-gray-300 text-sm mb-4", children: "Please refresh the site and try again." }), _jsxs("div", { className: "space-y-3", children: [_jsxs(Button, { onClick: handleCopyMessage, className: "w-full px-6 py-2 rounded-full font-bold transition-all duration-300 bg-gray-600 hover:bg-gray-500 text-white focus:outline-none focus:ring-0", children: [_jsx(Copy, { className: "mr-2 h-4 w-4" }), "Copy Message to Clipboard"] }), _jsx(Button, { onClick: handleTryAgain, className: "w-full px-6 py-2 rounded-full font-bold transition-all duration-300 focus:outline-none focus:ring-0", style: {
                                                            backgroundColor: colors.primary,
                                                            color: colors.primaryText || "white",
                                                        }, children: "Try Again" })] })] }))] }) }) }) })] }) }));
}
