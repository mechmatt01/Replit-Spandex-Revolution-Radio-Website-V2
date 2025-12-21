import React, { useState, useEffect } from "react";
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
import { PremiumTestProvider } from "./contexts/PremiumTestContext";
import { AccessibilityProvider } from "./components/AccessibilityProvider";
import DynamicMetaTags from "./components/DynamicMetaTags";
import VerificationModal from "./components/VerificationModal";
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

import { useFirebaseAuth } from "./contexts/FirebaseAuthContext";

function VerificationGate({ children }: { children: React.ReactNode }) {
  // For production, allow all users to access the app
  // No email verification required
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>

      <Route path="/" component={HomePage} />
      <Route path="/music" component={MusicPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/subscribe" component={SubscribePage} />
      <Route path="/support" component={SupportPage} />
      <Route path="/schedule" component={SchedulePage} />
      <Route path="/features" component={FeaturesPage} />
      <Route path="/map" component={MapPage} />
      <Route path="/submissions" component={SubmissionsPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/order-confirmation" component={OrderConfirmation} />
      <Route component={NotFound} />
    </Switch>
  );
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

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AccessibilityProvider>
          <FirebaseAuthProvider>
              <ThemeProvider>
                <PremiumTestProvider>
                  <RadioProvider>
                    <AdminProvider>
                    <TooltipProvider>
                      <DynamicMetaTags />
                      <Toaster />
                      <RecaptchaV3Provider siteKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ""}>
                        <VerificationGate>
                          <Router />
                          <LiveChat 
                            isEnabled={isChatEnabled}
                            onToggle={() => setIsChatEnabled(!isChatEnabled)}
                          />
                          <PerformanceMonitor showMetrics={false} logToConsole={true} />
                        </VerificationGate>
                      </RecaptchaV3Provider>
                    </TooltipProvider>
                    </AdminProvider>
                  </RadioProvider>
                </PremiumTestProvider>
              </ThemeProvider>
          </FirebaseAuthProvider>
        </AccessibilityProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;