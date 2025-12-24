import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import "./unified-focus-eliminator.css";
import "./unified-focus-eliminator.css";
// Import Firebase configuration to ensure it's initialized before React renders
import "./firebase";
import App from "./App";
import "./index.css";
// Load unhide last so it can override other global styles that hide content
import "./fix-unhide.css";

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

try {
  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error('Root element not found');
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} catch (err) {
  // If render fails, make sure at least the root and a simple message are visible
  console.error('React render failed:', err);
  try {
    const fallback = document.getElementById('root') || document.body;
    if (fallback) {
      fallback.innerHTML = '<div style="padding:24px;color:#fff;background:transparent;">Application failed to render — check console for errors.</div>';
    }
  } catch (e) {
    // ignore
  }
}
