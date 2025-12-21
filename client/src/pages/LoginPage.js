import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../hooks/use-toast";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { cn } from "../lib/utils";
export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        confirmPassword: "",
    });
    const { getColors, theme } = useTheme();
    const { toast } = useToast();
    const { register, signIn, signInWithGoogle, user } = useFirebaseAuth();
    const colors = getColors();
    const location = useLocation();
    // Redirect if already logged in
    if (user) {
        window.location.href = "/";
        return null;
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (!isLogin) {
                // Registration validation
                if (formData.password !== formData.confirmPassword) {
                    toast({
                        title: "Password Mismatch",
                        description: "Passwords do not match.",
                        variant: "destructive",
                    });
                    setIsLoading(false);
                    return;
                }
                if (formData.password.length < 6) {
                    toast({
                        title: "Password Too Short",
                        description: "Password must be at least 6 characters.",
                        variant: "destructive",
                    });
                    setIsLoading(false);
                    return;
                }
                // Register user
                const result = await register(formData.email, formData.password, formData.firstName, formData.lastName, formData.phoneNumber);
                if (result.success) {
                    toast({
                        title: "Account Created!",
                        description: "Your account has been created successfully. Welcome to Spandex Salvation Radio!",
                    });
                    window.location.href = "/";
                }
                else {
                    toast({
                        title: "Registration Failed",
                        description: result.error || "Please try again.",
                        variant: "destructive",
                    });
                }
            }
            else {
                // Login user
                const result = await signIn(formData.email, formData.password);
                if (result.success) {
                    toast({
                        title: "Welcome Back!",
                        description: "You have successfully signed in.",
                    });
                    window.location.href = "/";
                }
                else {
                    toast({
                        title: "Login Failed",
                        description: result.error || "Please try again.",
                        variant: "destructive",
                    });
                }
            }
        }
        catch (error) {
            console.error("Authentication error:", error);
            toast({
                title: isLogin ? "Login Failed" : "Registration Failed",
                description: error.message || "Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleGoogleAuth = async () => {
        try {
            setIsLoading(true);
            await signInWithGoogle();
            toast({
                title: "Google Authentication Successful!",
                description: "Welcome to Spandex Salvation Radio!",
            });
            window.location.href = "/";
        }
        catch (error) {
            console.error("Google authentication error:", error);
            toast({
                title: "Google Authentication Failed",
                description: error.message || "Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: cn("min-h-screen flex items-center justify-center p-4", theme === "light" ? "bg-white" : "bg-black"), children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "space-y-4", children: [_jsx("div", { className: "flex items-center space-x-2", children: _jsx(Link, { href: "/", children: _jsxs(Button, { variant: "ghost", size: "sm", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Home"] }) }) }), _jsxs("div", { className: "text-center", children: [_jsx(CardTitle, { className: "text-2xl font-bold", children: isLogin ? "Welcome Back" : "Create Account" }), _jsx("p", { className: "text-muted-foreground mt-2", children: isLogin
                                        ? "Login to your Spandex Salvation account"
                                        : "Join the metal revolution" })] })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs(Button, { type: "button", variant: "outline", className: "w-full bg-white text-black border-gray-300 hover:bg-gray-50", onClick: handleGoogleAuth, disabled: isLoading, children: [_jsx("img", { src: "/GoogleLogoIcon.png", alt: "Google", className: "w-4 h-4 mr-2" }), isLoading ? "Please wait..." : (isLogin ? "Continue with Google" : "Sign Up with Google")] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx(Separator, { className: "w-full" }) }), _jsx("div", { className: "relative flex justify-center text-xs uppercase", children: _jsx("span", { className: "bg-background px-2 text-muted-foreground", children: "Or continue with email" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [!isLogin && (_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "firstName", children: "First Name" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "firstName", type: "text", placeholder: "John", className: "pl-10", value: formData.firstName, onChange: (e) => setFormData((prev) => ({
                                                                ...prev,
                                                                firstName: e.target.value,
                                                            })), required: true })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "lastName", children: "Last Name" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "lastName", type: "text", placeholder: "Doe", className: "pl-10", value: formData.lastName, onChange: (e) => setFormData((prev) => ({
                                                                ...prev,
                                                                lastName: e.target.value,
                                                            })), required: true })] })] })] })), !isLogin && (_jsxs("div", { children: [_jsx(Label, { htmlFor: "phoneNumber", children: "Phone Number (Optional)" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "phoneNumber", type: "tel", placeholder: "+1 (555) 123-4567", className: "pl-10", value: formData.phoneNumber, onChange: (e) => setFormData((prev) => ({
                                                        ...prev,
                                                        phoneNumber: e.target.value,
                                                    })) })] })] })), _jsxs("div", { children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "email", type: "email", placeholder: "john@example.com", className: "pl-10", value: formData.email, onChange: (e) => setFormData((prev) => ({ ...prev, email: e.target.value })), required: true })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "password", type: showPassword ? "text" : "password", placeholder: isLogin ? "Enter your password" : "Create a password", className: "pl-10 pr-10", value: formData.password, onChange: (e) => setFormData((prev) => ({
                                                        ...prev,
                                                        password: e.target.value,
                                                    })), required: true }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-3 text-muted-foreground hover:text-foreground", children: showPassword ? (_jsx(EyeOff, { className: "h-4 w-4" })) : (_jsx(Eye, { className: "h-4 w-4" })) })] })] }), !isLogin && (_jsxs("div", { children: [_jsx(Label, { htmlFor: "confirmPassword", children: "Confirm Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "confirmPassword", type: showPassword ? "text" : "password", placeholder: "Confirm your password", className: "pl-10", value: formData.confirmPassword, onChange: (e) => setFormData((prev) => ({
                                                        ...prev,
                                                        confirmPassword: e.target.value,
                                                    })), required: true })] })] })), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, style: { backgroundColor: colors.primary }, children: isLoading
                                        ? "Please wait..."
                                        : isLogin
                                            ? "Login"
                                            : "Create Account" })] }), _jsx("div", { className: "text-center", children: _jsx("button", { type: "button", onClick: () => setIsLogin(!isLogin), className: "text-sm text-muted-foreground hover:text-foreground underline", children: isLogin
                                    ? "Don't have an account? Sign up"
                                    : "Already have an account? Login" }) })] })] }) }));
}
