import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, LogIn, UserPlus, Phone, X } from "lucide-react";
import GoogleLogoPath from "/GoogleLogoIcon.png";
export default function AuthModal({ isOpen, onClose, initialMode = "login", }) {
    const [mode, setMode] = useState(initialMode);
    // Update mode when initialMode prop changes
    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState("");
    const { isAuthenticated, signInWithGoogle, register: firebaseRegister, signIn: firebaseSignIn } = useFirebaseAuth();
    const { getColors } = useTheme();
    const { toast } = useToast();
    const colors = getColors();
    const handleGoogleAuth = async () => {
        try {
            setLoading(true);
            await signInWithGoogle();
            // The redirect will happen automatically
            onClose();
        }
        catch (error) {
            toast({
                title: "Sign In Failed",
                description: error.message || "Failed to sign in with Google.",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    // Phone number formatting
    const formatPhoneNumber = (value) => {
        const phoneNumber = value.replace(/[^\d]/g, "");
        const phoneNumberLength = phoneNumber?.length || 0;
        if (phoneNumberLength < 4)
            return phoneNumber;
        if (phoneNumberLength < 7) {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        }
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    };
    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === "login") {
                // Use Firebase Auth sign in
                const result = await firebaseSignIn(email, password);
                if (!result.success) {
                    throw new Error(result.error || "Login failed");
                }
                toast({
                    title: "Welcome back!",
                    description: "You've successfully logged in.",
                });
                // Close modal and refresh to update authentication state
                onClose();
                window.location.reload();
            }
            else {
                // Use Firebase Auth registration
                const result = await firebaseRegister(email, password, firstName, lastName, phoneNumber.replace(/[^\d]/g, ""));
                if (!result.success) {
                    throw new Error(result.error || "Registration failed");
                }
                toast({
                    title: "Account created!",
                    description: "Welcome to Spandex Salvation Radio!",
                });
                // Close modal and refresh to update authentication state
                onClose();
                window.location.reload();
            }
            resetForm();
        }
        catch (error) {
            toast({
                title: mode === "login" ? "Login failed" : "Registration failed",
                description: error.message || "Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    const resetForm = () => {
        setEmail("");
        setPassword("");
        setUsername("");
        setFirstName("");
        setLastName("");
        setPhoneNumber("");
    };
    const switchMode = () => {
        setMode(mode === "login" ? "register" : "login");
        resetForm();
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "w-full max-w-md animate-in fade-in zoom-in duration-300 relative", style: {
                backgroundColor: colors.background || 'rgba(0, 0, 0, 0.95)',
                border: `2px solid ${colors.primary}40`,
                borderRadius: '16px',
                boxShadow: `0 25px 50px -12px ${colors.primary}20`,
            }, children: [/* Close Button - Fixed positioning and always visible */ _jsx("button", { onClick: onClose, className: "absolute -top-3 -right-3 z-50 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2", style: {
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
            }, "aria-label": "Close modal", children: _jsx(X, { className: "h-4 w-4" }) }), _jsx(DialogHeader, { children: _jsx(DialogTitle, { className: "flex items-center gap-2", style: { color: colors.text }, children: mode === "login" ? (_jsxs(_Fragment, { children: [_jsx(LogIn, { className: "h-5 w-5", style: { color: colors.primary } }), "Sign In"] })) : (_jsxs(_Fragment, { children: [_jsx(UserPlus, { className: "h-5 w-5", style: { color: colors.primary } }), "Create Account"] })) }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [mode === "register" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "username", style: { color: colors.text, fontWeight: '600' }, children: "Username" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { id: "username", value: username, onChange: (e) => setUsername(e.target.value), className: "pl-10 transition-all duration-200", style: {
                                                        color: colors.text,
                                                        backgroundColor: colors.background || 'rgba(0, 0, 0, 0.5)',
                                                        borderColor: colors.primary + '40',
                                                        borderRadius: '8px',
                                                    }, onFocus: (e) => (e.currentTarget.style.borderColor = colors.primary), onBlur: (e) => (e.currentTarget.style.borderColor = colors.primary + '40'), placeholder: "Username", required: true })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "firstName", style: { color: colors.text, fontWeight: '600' }, children: "First Name" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { id: "firstName", value: firstName, onChange: (e) => setFirstName(e.target.value), className: "pl-10 transition-all duration-200", style: {
                                                                color: colors.text,
                                                                backgroundColor: colors.background || 'rgba(0, 0, 0, 0.5)',
                                                                borderColor: colors.primary + '40',
                                                                borderRadius: '8px',
                                                            }, onFocus: (e) => (e.currentTarget.style.borderColor = colors.primary), onBlur: (e) => (e.currentTarget.style.borderColor = colors.primary + '40'), placeholder: "John", required: true })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "lastName", style: { color: colors.text, fontWeight: '600' }, children: "Last Name" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { id: "lastName", value: lastName, onChange: (e) => setLastName(e.target.value), className: "pl-10 transition-all duration-200", style: {
                                                                color: colors.text,
                                                                backgroundColor: colors.background || 'rgba(0, 0, 0, 0.5)',
                                                                borderColor: colors.primary + '40',
                                                                borderRadius: '8px',
                                                            }, onFocus: (e) => (e.currentTarget.style.borderColor = colors.primary), onBlur: (e) => (e.currentTarget.style.borderColor = colors.primary + '40'), placeholder: "Doe", required: true })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "phoneNumber", style: { color: colors.text, fontWeight: '600' }, children: "Phone Number" }), _jsxs("div", { className: "relative", children: [_jsx(Phone, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { id: "phoneNumber", type: "tel", value: phoneNumber, onChange: handlePhoneChange, className: "pl-10 transition-all duration-200", style: {
                                                        color: colors.text,
                                                        backgroundColor: colors.background || 'rgba(0, 0, 0, 0.5)',
                                                        borderColor: colors.primary + '40',
                                                        borderRadius: '8px',
                                                    }, onFocus: (e) => (e.currentTarget.style.borderColor = colors.primary), onBlur: (e) => (e.currentTarget.style.borderColor = colors.primary + '40'), placeholder: "(555) 123-4567", required: true })] })] })] })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", style: { color: colors.text, fontWeight: '600' }, children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "pl-10 transition-all duration-200", style: {
                                                color: colors.text,
                                                backgroundColor: colors.background || 'rgba(0, 0, 0, 0.5)',
                                                borderColor: colors.primary + '40',
                                                borderRadius: '8px',
                                            }, onFocus: (e) => (e.currentTarget.style.borderColor = colors.primary), onBlur: (e) => (e.currentTarget.style.borderColor = colors.primary + '40'), placeholder: "email@example.com", required: true })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", style: { color: colors.text, fontWeight: '600' }, children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "pl-10 transition-all duration-200", style: {
                                                color: colors.text,
                                                backgroundColor: colors.background || 'rgba(0, 0, 0, 0.5)',
                                                borderColor: colors.primary + '40',
                                                borderRadius: '8px',
                                            }, onFocus: (e) => (e.currentTarget.style.borderColor = colors.primary), onBlur: (e) => (e.currentTarget.style.borderColor = colors.primary + '40'), placeholder: "Password", autoComplete: mode === "login" ? "current-password" : "new-password", required: true })] })] }), _jsx(Button, { type: "submit", className: "w-full text-white border-0 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-0", style: {
                                backgroundColor: colors.primary,
                                border: `2px solid ${colors.primary}`,
                                boxShadow: `0 4px 20px ${colors.primary}40`,
                            }, onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = colors.secondary), onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = colors.primary), disabled: loading, children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), mode === "login" ? "Logging In..." : "Creating Account..."] })) : mode === "login" ? ("Login") : ("Create Account") }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("span", { className: "w-full border-t border-gray-600" }) }), _jsx("div", { className: "relative flex justify-center text-xs uppercase", children: _jsx("span", { className: "bg-black px-2 text-gray-400", children: "Or continue with" }) })] }), _jsxs(Button, { type: "button", variant: "outline", onClick: handleGoogleAuth, className: "w-full rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-0", style: {
                                backgroundColor: colors.background || 'rgba(255, 255, 255, 0.1)',
                                color: colors.text,
                                border: `2px solid ${colors.primary}40`,
                                backdropFilter: 'blur(10px)',
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = colors.primary + '20';
                                e.currentTarget.style.borderColor = colors.primary;
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = colors.background || 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.borderColor = colors.primary + '40';
                            }, disabled: loading, children: [_jsx("img", { src: GoogleLogoPath, alt: "Google", className: "mr-2 h-4 w-4" }), mode === "login"
                                    ? "Continue with Google"
                                    : "Sign Up with Google"] }), _jsx("div", { className: "text-center", children: _jsx("button", { type: "button", onClick: switchMode, className: "text-sm transition-colors duration-200 focus:outline-none focus:ring-0", style: { color: colors.primary }, onMouseEnter: (e) => (e.currentTarget.style.color = colors.secondary), onMouseLeave: (e) => (e.currentTarget.style.color = colors.primary), children: mode === "login"
                                    ? "Don't have an account? Sign up"
                                    : "Already have an account? Sign in" }) })] })] }) }));
}
