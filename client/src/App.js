import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
// Import CSS to fix white border issues
import "./no-white-borders.css";
import { AdminProvider } from "./contexts/AdminContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { RadioProvider } from "./contexts/RadioContext";
import { FirebaseAuthProvider } from "./contexts/FirebaseAuthContext";
import { AccessibilityProvider } from "./components/AccessibilityProvider";
import DynamicMetaTags from "./components/DynamicMetaTags";
import { RecaptchaV3Provider } from "./components/RecaptchaV3";
import ErrorBoundary from "./components/ErrorBoundary";
import LiveChat from "./components/LiveChat";
import { initializeChatCleanup } from "./lib/chat";
import HomePage from "./pages/HomePage";
import MusicPage from "./pages/MusicPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SubscribePage from "./pages/SubscribePage";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import OrderConfirmation from "./components/OrderConfirmation";
import NotFound from "./pages/not-found";
function VerificationGate({ children }) {
    // For production, allow all users to access the app
    // No email verification required
    return _jsx(_Fragment, { children: children });
}
function Router() {
    return (_jsxs(Switch, { children: [_jsx(Route, { path: "/", component: HomePage }), _jsx(Route, { path: "/music", component: MusicPage }), _jsx(Route, { path: "/profile", component: ProfilePage }), _jsx(Route, { path: "/login", component: LoginPage }), _jsx(Route, { path: "/subscribe", component: SubscribePage }), _jsx(Route, { path: "/terms", component: TermsOfService }), _jsx(Route, { path: "/privacy", component: PrivacyPolicy }), _jsx(Route, { path: "/order-confirmation", component: OrderConfirmation }), _jsx(Route, { component: NotFound })] }));
}
function App() {
    const [isChatEnabled, setIsChatEnabled] = useState(true);
    // Initialize chat cleanup on app start
    useEffect(() => {
        initializeChatCleanup();
    }, []);
    return (_jsx(ErrorBoundary, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(AccessibilityProvider, { children: _jsx(FirebaseAuthProvider, { children: _jsx(ThemeProvider, { children: _jsx(RadioProvider, { children: _jsx(AdminProvider, { children: _jsxs(TooltipProvider, { children: [_jsx(DynamicMetaTags, {}), _jsx(Toaster, {}), _jsx(RecaptchaV3Provider, { siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || "", children: _jsxs(VerificationGate, { children: [_jsx(Router, {}), _jsx(LiveChat, { isEnabled: isChatEnabled, onToggle: () => setIsChatEnabled(!isChatEnabled) })] }) })] }) }) }) }) }) }) }) }));
}
export default App;
