import React, { useState, useEffect } from "react";
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
import VerificationModal from "./components/VerificationModal";
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
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/order-confirmation" component={OrderConfirmation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isChatEnabled, setIsChatEnabled] = useState(true);

  // Initialize chat cleanup on app start
  useEffect(() => {
    initializeChatCleanup();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AccessibilityProvider>
          <FirebaseAuthProvider>
              <ThemeProvider>
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
                        </VerificationGate>
                      </RecaptchaV3Provider>
                    </TooltipProvider>
                  </AdminProvider>
                </RadioProvider>
              </ThemeProvider>
          </FirebaseAuthProvider>
        </AccessibilityProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;