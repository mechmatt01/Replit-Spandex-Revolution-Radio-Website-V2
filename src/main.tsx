import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import "./unified-focus-eliminator.css";
// Import Firebase configuration to ensure it's initialized before React renders
import "./firebase";
import App from "./App";
import "./index.css";

// Global currentTheme variable to prevent React error handler crashes
declare global {
  interface Window {
    currentTheme?: string;
  }
}

// Set a default value to prevent crashes
window.currentTheme = "classic-metal";

// Global error handler to catch currentTheme issues
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('currentTheme is not defined')) {
    console.error('🔴 CRITICAL ERROR: currentTheme is not defined');
    console.error('Error details:', event.error);
    console.error('Error stack:', event.error.stack);
    console.error('Current URL:', window.location.href);
    console.error('Document ready state:', document.readyState);
    
    // Check if ThemeContext is available
    try {
      const themeElements = document.querySelectorAll('[data-theme]');
      console.error('Theme elements found:', themeElements.length);
    } catch (e) {
      console.error('Error checking theme elements:', e);
    }
  }
});

// Register service worker for performance optimization
// Service Worker registration (only in production)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
} else if ('serviceWorker' in navigator && import.meta.env.DEV) {
  console.log('Service Worker registration skipped in development mode');
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
