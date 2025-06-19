import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudioProvider } from "@/contexts/AudioContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { RadioProvider } from "@/contexts/RadioContext";
import SkipToContent from "@/components/SkipToContent";
import HomePage from "@/pages/HomePage";
import MusicPage from "@/pages/MusicPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/music" component={MusicPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RadioProvider>
          <AudioProvider>
            <AdminProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </AdminProvider>
          </AudioProvider>
        </RadioProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
