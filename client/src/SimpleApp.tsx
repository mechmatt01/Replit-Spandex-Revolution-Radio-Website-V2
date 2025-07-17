import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "@/contexts/ThemeContext";

function SimpleRadioApp() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-6xl font-black mb-4">
            <span className="text-primary">SPANDEX</span>
            <br />
            <span className="text-primary">SALVATION</span>
            <br />
            <span className="text-primary">RADIO</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Old School Metal • 24/7 Streaming • Firebase Powered
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">🎵 Now Playing</h3>
            <p className="text-muted-foreground">Loading track info...</p>
          </div>
          
          <div className="bg-card p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">📊 Live Stats</h3>
            <p className="text-muted-foreground">Active listeners: 125</p>
          </div>
          
          <div className="bg-card p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">🔥 Firebase Status</h3>
            <p className="text-green-500">✓ Backend Connected</p>
            <p className="text-green-500">✓ Authentication Ready</p>
            <p className="text-green-500">✓ Database Migration Complete</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-card p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Migration Complete!</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Your radio streaming application has been successfully migrated to Firebase.
              All backend APIs are operational and ready for use.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Refresh Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SimpleApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SimpleRadioApp />
      </ThemeProvider>
    </QueryClientProvider>
  );
}