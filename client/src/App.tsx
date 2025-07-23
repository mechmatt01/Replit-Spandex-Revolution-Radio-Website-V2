import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AdminProvider } from "@/contexts/AdminContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { RadioProvider } from "@/contexts/RadioContext";
import { AuthProvider } from "@/contexts/AuthContext";
import SkipToContent from "@/components/SkipToContent";
import DynamicMetaTags from "@/components/DynamicMetaTags";
import VerificationModal from "@/components/VerificationModal";
import { useAuth } from "@/hooks/useAuth";

import HomePage from "@/pages/HomePage";
import MusicPage from "@/pages/MusicPage";
import ProfilePage from "@/pages/ProfilePage";
import LoginPage from "@/pages/LoginPage";
import SubscribePage from "@/pages/SubscribePage";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import OrderConfirmation from "@/components/OrderConfirmation";
import NotFound from "@/pages/not-found";
import TestPage from "./TestPage";
// import { useAuth } from "./hooks/useAuth";

function VerificationGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  if (isLoading) return null;
  if (!user) return <>{children}</>; // Not logged in, allow access to public routes

  // If not verified, show the appropriate modal and block app
  if (!user.isEmailVerified) {
    return (
      <VerificationModal
        isOpen={true}
        onClose={() => setShowEmailModal(false)}
        type="email"
        contactInfo={user.email}
      />
    );
  }
  if (!user.isPhoneVerified) {
    return (
      <VerificationModal
        isOpen={true}
        onClose={() => setShowPhoneModal(false)}
        type="phone"
        contactInfo={user.phoneNumber}
      />
    );
  }
  // Both verified, allow app
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/test" component={TestPage} />
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

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <RadioProvider>
            <AdminProvider>
              <TooltipProvider>
                <SkipToContent />
                <DynamicMetaTags />
                <Toaster />
                <VerificationGate>
                  <Router />
                </VerificationGate>
              </TooltipProvider>
            </AdminProvider>
          </RadioProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
