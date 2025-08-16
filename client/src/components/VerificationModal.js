import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Phone, Mail, CheckCircle } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { useRecaptcha } from "./RecaptchaV3";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
export default function VerificationModal({ isOpen, onClose, type, contactInfo, }) {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const { colors } = useTheme();
    const { toast } = useToast();
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [recaptchaReady, setRecaptchaReady] = useState(false);
    // Safety check for contactInfo
    if (!contactInfo || contactInfo.trim() === '') {
        return null; // Don't render if no contact info
    }
    // reCAPTCHA Enterprise integration for SMS fraud detection
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";
    const isRecaptchaConfigured = siteKey && siteKey !== "your_recaptcha_site_key_here";
    // Only use reCAPTCHA if properly configured
    const { executeRecaptcha } = isRecaptchaConfigured ? useRecaptcha() : { executeRecaptcha: null };
    // Setup reCAPTCHA for phone verification
    useEffect(() => {
        if (type === "phone" && isOpen && !window.recaptchaVerifier) {
            if (isRecaptchaConfigured) {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    size: 'invisible',
                    callback: () => setRecaptchaReady(true),
                });
                setRecaptchaReady(true);
            }
            else {
                // Fallback: set ready state without reCAPTCHA
                setRecaptchaReady(true);
            }
        }
        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        };
    }, [type, isOpen, isRecaptchaConfigured]);
    // Send SMS when modal opens for phone
    useEffect(() => {
        if (type === "phone" && isOpen && recaptchaReady && !confirmationResult) {
            setSendingCode(true);
            if (isRecaptchaConfigured && window.recaptchaVerifier) {
                // Use reCAPTCHA if configured
                signInWithPhoneNumber(auth, contactInfo, window.recaptchaVerifier)
                    .then((result) => {
                    setConfirmationResult(result);
                    toast({ title: "Code Sent", description: `A verification code was sent to ${contactInfo}.` });
                })
                    .catch((error) => {
                    toast({ title: "Error", description: error.message, variant: "destructive" });
                })
                    .finally(() => setSendingCode(false));
            }
            else {
                // Fallback: simulate SMS sending for development/testing
                setTimeout(() => {
                    toast({ title: "Code Sent", description: `A verification code was sent to ${contactInfo}. (Development mode)` });
                    setSendingCode(false);
                }, 1000);
            }
        }
    }, [type, isOpen, recaptchaReady, contactInfo, confirmationResult, toast, isRecaptchaConfigured]);
    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setCode("");
            setVerified(false);
            setLoading(false);
            setSendingCode(false);
        }
    }, [isOpen]);
    const handleVerify = async (e) => {
        e.preventDefault();
        if (loading || !code.trim())
            return;
        setLoading(true);
        try {
            if (type === "phone") {
                if (isRecaptchaConfigured && confirmationResult) {
                    // Use Firebase phone verification if reCAPTCHA is configured
                    await confirmationResult.confirm(code);
                    // Mark phone as verified in backend
                    await apiRequest("POST", "/api/user/phone-verified", {});
                }
                else {
                    // Development mode: simulate verification with any code
                    if (code === "123456" || code === "000000") {
                        // Mark phone as verified in backend
                        await apiRequest("POST", "/api/user/phone-verified", {});
                    }
                    else {
                        throw new Error("Invalid verification code. Try 123456 or 000000 in development mode.");
                    }
                }
            }
            else {
                await apiRequest("POST", "/api/user/verify-email", { code });
            }
            setVerified(true);
            toast({ title: "Verification Successful!", description: `Your ${type} has been verified.` });
            setTimeout(() => {
                onClose();
                setCode("");
                setVerified(false);
            }, 2000);
        }
        catch (error) {
            toast({ title: "Verification Failed", description: error.message || "Invalid verification code. Please try again.", variant: "destructive" });
        }
        finally {
            setLoading(false);
        }
    };
    const handleResend = async () => {
        if (sendingCode)
            return;
        setSendingCode(true);
        try {
            if (type === "phone") {
                // Resend SMS
                if (isRecaptchaConfigured && window.recaptchaVerifier) {
                    signInWithPhoneNumber(auth, contactInfo, window.recaptchaVerifier)
                        .then((result) => {
                        setConfirmationResult(result);
                        toast({ title: "Code Sent", description: `A new verification code was sent to ${contactInfo}.` });
                    })
                        .catch((error) => {
                        toast({ title: "Error", description: error.message, variant: "destructive" });
                    })
                        .finally(() => setSendingCode(false));
                }
                else {
                    // Fallback: simulate SMS resending for development/testing
                    setTimeout(() => {
                        toast({ title: "Code Sent", description: `A new verification code was sent to ${contactInfo}. (Development mode)` });
                        setSendingCode(false);
                    }, 1000);
                }
            }
            else {
                await apiRequest("POST", "/api/user/send-email-verification", {});
                toast({ title: "Code Sent", description: `A new verification code has been sent to your email.` });
            }
        }
        catch (error) {
            toast({ title: "Error", description: error.message || "Failed to send verification code.", variant: "destructive" });
            setSendingCode(false);
        }
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "sm:max-w-md", style: { backgroundColor: colors.cardBackground, borderColor: colors.primary, color: colors.text }, children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { className: "flex items-center gap-3 text-xl font-bold", children: verified ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-6 w-6", style: { color: "#10B981" } }), "Verified!"] })) : (_jsxs(_Fragment, { children: [type === "phone" ? (_jsx(Phone, { className: "h-6 w-6", style: { color: colors.primary } })) : (_jsx(Mail, { className: "h-6 w-6", style: { color: colors.primary } })), "Verify ", type === "phone" ? "Phone Number" : "Email Address"] })) }) }), type === "phone" && _jsx("div", { id: "recaptcha-container" }), verified ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(CheckCircle, { className: "h-16 w-16 mx-auto mb-4", style: { color: "#10B981" } }), _jsxs("p", { className: "text-lg", style: { color: colors.text }, children: ["Your ", type, " has been successfully verified!"] })] })) : (_jsxs("form", { onSubmit: handleVerify, className: "space-y-6", children: [_jsxs("div", { className: "text-center space-y-2", children: [_jsx("p", { style: { color: colors.text }, children: "We sent a verification code to:" }), _jsx("p", { className: "font-medium", style: { color: colors.primary }, children: contactInfo }), _jsxs("p", { className: "text-sm opacity-75", style: { color: colors.text }, children: ["Enter the 6-digit code to verify your ", type, "."] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "verification-code", style: { color: colors.text }, children: "Verification Code" }), _jsx(Input, { id: "verification-code", type: "text", value: code, onChange: (e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6)), className: "text-center text-2xl tracking-wider bg-black/50", style: { color: colors.text, borderColor: "#374151" }, onFocus: (e) => (e.currentTarget.style.borderColor = colors.primary), onBlur: (e) => (e.currentTarget.style.borderColor = "#374151"), placeholder: "000000", maxLength: 6, required: true })] }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx(Button, { type: "submit", disabled: loading || (code?.length || 0) !== 6, className: "w-full py-3 font-semibold transition-all duration-200 focus:outline-none focus:ring-0", style: { backgroundColor: colors.primary, color: "white", opacity: loading || (code?.length || 0) !== 6 ? 0.6 : 1 }, children: loading ? "Verifying..." : "Verify Code" }), _jsx(Button, { type: "button", variant: "ghost", onClick: handleResend, className: "text-sm focus:outline-none focus:ring-0", style: { color: colors.primary }, children: "Didn't receive the code? Resend" })] })] }))] }) }));
}
