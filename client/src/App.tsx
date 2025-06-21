import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudioProvider } from "@/contexts/AudioContext";
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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/music" component={MusicPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/subscribe" component={SubscribePage} />
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
            <AudioProvider>
              <AdminProvider>
                <TooltipProvider>
                  <SkipToContent />
                  <DynamicMetaTags />
                  <Toaster />
                  <Router />
                </TooltipProvider>
              </AdminProvider>
            </AudioProvider>
          </RadioProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
