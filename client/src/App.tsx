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
import HomePage from "@/pages/HomePage";
import MusicPage from "@/pages/MusicPage";
import ProfilePage from "@/pages/ProfilePage";
import LoginPage from "@/pages/LoginPage";
import SubscribePage from "@/pages/SubscribePage";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import OrderConfirmation from "@/components/OrderConfirmation";
import NotFound from "@/pages/not-found";
import { useAuth } from "./hooks/useAuth";
import { ErrorBoundary } from "react-error-boundary";

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

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
        <p className="text-lg mb-4">The application encountered an error:</p>
        <pre className="bg-card p-4 rounded text-sm overflow-auto mb-4">
          {error.message}
        </pre>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <RadioProvider>
              <AdminProvider>
                <TooltipProvider>
                  <SkipToContent />
                  <DynamicMetaTags />
                  <Toaster />
                  <Router />
                </TooltipProvider>
              </AdminProvider>
            </RadioProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
