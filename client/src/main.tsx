import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Comprehensive loading completion for all browsers
function ensureLoadingComplete() {
  // Handle Safari mobile and other webkit browsers
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        document.dispatchEvent(new Event('DOMContentLoaded'));
      }, 100);
    });
  }
  
  // Handle all resources including images, fonts, and async resources
  window.addEventListener('load', () => {
    // Additional delay for Safari mobile resource loading
    setTimeout(() => {
      document.dispatchEvent(new Event('load'));
      // Force completion of any remaining loading indicators
      if (window.performance && window.performance.getEntriesByType) {
        const resources = window.performance.getEntriesByType('resource');
        if (resources.length > 0) {
          // Ensure all resources are marked as complete
          setTimeout(() => {
            document.body.classList.add('fully-loaded');
          }, 200);
        }
      }
    }, 300);
  });
}

// Initialize loading completion
ensureLoadingComplete();

createRoot(document.getElementById("root")!).render(<App />);
