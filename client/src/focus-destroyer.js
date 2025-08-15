// SELECTIVE FOCUS STYLE MANAGER - JAVASCRIPT APPROACH
// This script manages focus styles selectively to prevent unwanted white borders while preserving accessibility

(function() {
  'use strict';
  
  // Create selective CSS to manage focus styles
  const css = `
    /* SELECTIVE FOCUS STYLE MANAGEMENT - HIGHEST PRIORITY */
    /* Remove default browser focus styles but allow custom ones */
    html body *:focus:not(button):not([role="button"]):not(input):not(textarea):not(select):not(a):not([tabindex]) {
      outline: none !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
    }
    
    /* Preserve focus styles for interactive elements */
    html body button:focus,
    html body button:focus-visible,
    html body [role="button"]:focus,
    html body [role="button"]:focus-visible,
    html body input:focus,
    html body input:focus-visible,
    html body textarea:focus,
    html body textarea:focus-visible,
    html body select:focus,
    html body select:focus-visible,
    html body a:focus,
    html body a:focus-visible,
    html body [tabindex]:focus,
    html body [tabindex]:focus-visible {
      /* Allow these elements to have focus styles */
      outline: 2px solid transparent !important;
      outline-offset: 2px !important;
    }
    
    /* Allow custom focus ring classes to work */
    html body .focus\\:ring-2:focus,
    html body .focus\\:ring-1:focus,
    html body .focus\\:ring-0:focus,
    html body .focus\\:ring:focus,
    html body .focus-visible\\:ring-2:focus-visible,
    html body .focus-visible\\:ring-1:focus-visible,
    html body .focus-visible\\:ring-0:focus-visible,
    html body .focus-visible\\:ring:focus-visible {
      outline: none !important;
      /* Allow these specific focus ring classes to work */
    }
    
    /* Override browser defaults for non-interactive elements */
    html body *:not(button):not([role="button"]):not(input):not(textarea):not(select):not(a):not([tabindex])::-webkit-focus-ring-color {
      color: transparent !important;
    }
    
    html body *:not(button):not([role="button"]):not(input):not(textarea):not(select):not(a):not([tabindex])::-moz-focus-inner {
      border: 0 !important;
    }
    
    html body *:not(button):not([role="button"]):not(input):not(textarea):not(select):not(a):not([tabindex]):-moz-focusring {
      outline: none !important;
    }
  `;
  
  // Inject CSS with maximum priority
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = css;
  style.id = 'focus-manager-selective';
  document.head.appendChild(style);
  
  // Function to manage focus styles on any element
  function manageFocusStyles(element) {
    if (element && element.style) {
      // Check if element is interactive
      const isInteractive = element.tagName === 'BUTTON' || 
                           element.tagName === 'INPUT' || 
                           element.tagName === 'TEXTAREA' || 
                           element.tagName === 'SELECT' || 
                           element.tagName === 'A' ||
                           element.getAttribute('role') === 'button' ||
                           element.hasAttribute('tabindex');
      
      if (!isInteractive) {
        // Only remove default outline for non-interactive elements
        element.style.outline = 'none';
        
        // Check if element has custom focus ring classes
        const hasCustomFocusRing = element.classList.contains('focus:ring-2') || 
                                  element.classList.contains('focus:ring-1') || 
                                  element.classList.contains('focus:ring-0') || 
                                  element.classList.contains('focus:ring') ||
                                  element.classList.contains('focus-visible:ring-2') || 
                                  element.classList.contains('focus-visible:ring-1') || 
                                  element.classList.contains('focus-visible:ring-0') || 
                                  element.classList.contains('focus-visible:ring');
        
        if (!hasCustomFocusRing) {
          // Remove default focus styles for elements without custom focus rings
          element.style.setProperty('outline', 'none', 'important');
          element.style.setProperty('box-shadow', 'none', 'important');
        }
      }
    }
  }
  
  // Apply to all current elements
  function applyToAll() {
    document.querySelectorAll('*').forEach(manageFocusStyles);
  }
  
  // Event listeners for focus events
  document.addEventListener('focus', function(e) {
    manageFocusStyles(e.target);
  }, true);
  
  document.addEventListener('focusin', function(e) {
    manageFocusStyles(e.target);
  }, true);
  
  // Apply to new elements as they're added
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            manageFocusStyles(node);
            // Also apply to child elements
            if (node.querySelectorAll) {
              node.querySelectorAll('*').forEach(manageFocusStyles);
            }
          }
        });
      }
    });
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Apply to all elements when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyToAll);
  } else {
    applyToAll();
  }
  
  // Also apply after a short delay to catch any late-rendered elements
  setTimeout(applyToAll, 100);
  setTimeout(applyToAll, 500);
  setTimeout(applyToAll, 1000);
})();