import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudioProvider } from "@/contexts/AudioContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import HomePage from "@/pages/HomePage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AudioProvider>
          <AdminProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AdminProvider>
        </AudioProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
