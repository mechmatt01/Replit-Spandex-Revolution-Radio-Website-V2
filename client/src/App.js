import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
// Import CSS to fix white border issues
import "./no-white-borders.css";
// Import Firebase Performance Monitoring
import { initializePerformanceMonitoring } from "./lib/performance";
import { performanceCollector } from "./lib/performanceCollector";
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
import PerformanceMonitor from "./components/PerformanceMonitor";
import HomePage from "./pages/HomePage";
import MusicPage from "./pages/MusicPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SubscribePage from "./pages/SubscribePage";
import SupportPage from "./pages/SupportPage";
import SchedulePage from "./pages/SchedulePage";
import FeaturesPage from "./pages/FeaturesPage";
import MapPage from "./pages/MapPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import ContactPage from "./pages/ContactPage";
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
    return (_jsxs(Switch, { children: [_jsx(Route, { path: "/", component: HomePage }), _jsx(Route, { path: "/music", component: MusicPage }), _jsx(Route, { path: "/profile", component: ProfilePage }), _jsx(Route, { path: "/login", component: LoginPage }), _jsx(Route, { path: "/subscribe", component: SubscribePage }), _jsx(Route, { path: "/support", component: SupportPage }), _jsx(Route, { path: "/schedule", component: SchedulePage }), _jsx(Route, { path: "/features", component: FeaturesPage }), _jsx(Route, { path: "/map", component: MapPage }), _jsx(Route, { path: "/submissions", component: SubmissionsPage }), _jsx(Route, { path: "/contact", component: ContactPage }), _jsx(Route, { path: "/terms", component: TermsOfService }), _jsx(Route, { path: "/privacy", component: PrivacyPolicy }), _jsx(Route, { path: "/order-confirmation", component: OrderConfirmation }), _jsx(Route, { component: NotFound })] }));
}
function App() {
    const [isChatEnabled, setIsChatEnabled] = useState(true);
    // Initialize Firebase Performance Monitoring and chat cleanup on app start
    useEffect(() => {
        initializePerformanceMonitoring();
        initializeChatCleanup();
        // Initialize performance data collection for the entire site
        // This will start collecting performance metrics from all users
        console.log('Performance data collection initialized for site-wide monitoring');
        // Cleanup performance collector on app unmount
        return () => {
            performanceCollector.destroy();
        };
    }, []);
    return (_jsx(ErrorBoundary, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(AccessibilityProvider, { children: _jsx(FirebaseAuthProvider, { children: _jsx(ThemeProvider, { children: _jsx(RadioProvider, { children: _jsx(AdminProvider, { children: _jsxs(TooltipProvider, { children: [_jsx(DynamicMetaTags, {}), _jsx(Toaster, {}), _jsx(RecaptchaV3Provider, { siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || "", children: _jsxs(VerificationGate, { children: [_jsx(Router, {}), _jsx(LiveChat, { isEnabled: isChatEnabled, onToggle: () => setIsChatEnabled(!isChatEnabled) }), _jsx(PerformanceMonitor, { showMetrics: false, logToConsole: true })] }) })] }) }) }) }) }) }) }) }));
}
export default App;
