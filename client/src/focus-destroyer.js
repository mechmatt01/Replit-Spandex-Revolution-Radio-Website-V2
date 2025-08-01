// ULTIMATE FOCUS RING DESTROYER - JAVASCRIPT APPROACH
// This script completely eliminates all focus rings using multiple methods

(function() {
  'use strict';
  
  // Create the most aggressive CSS to eliminate all focus rings
  const css = `
    /* NUCLEAR FOCUS ELIMINATION - HIGHEST PRIORITY */
    html body * {
      outline: none !important;
      box-shadow: none !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
    }
    
    /* PRESERVE GLASS/BLUR EFFECTS */
    html body .backdrop-blur-lg,
    html body .backdrop-blur-md,
    html body .backdrop-blur-sm,
    html body .backdrop-blur-xl,
    html body .blur-md,
    html body .blur-sm,
    html body .filter,
    html body [class*="backdrop-blur"],
    html body [class*="blur-"] {
      backdrop-filter: inherit !important;
      -webkit-backdrop-filter: inherit !important;
      filter: inherit !important;
    }
    
    html body *:focus,
    html body *:focus-visible,
    html body *:active {
      outline: 0 !important;
      outline: none !important;
      outline-width: 0 !important;
      outline-color: transparent !important;
      outline-style: none !important;
      /* Keep existing borders for design */
      box-shadow: none !important;
      box-shadow: 0 0 0 0 transparent !important;
    }
    
    /* Override browser defaults */
    html body *::-webkit-focus-ring-color {
      color: transparent !important;
    }
    
    html body *::-moz-focus-inner {
      border: 0 !important;
    }
    
    html body *:-moz-focusring {
      outline: none !important;
    }
  `;
  
  // Inject CSS with maximum priority
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = css;
  style.id = 'focus-destroyer-ultimate';
  document.head.appendChild(style);
  
  // Function to eliminate focus on any element
  function eliminateFocus(element) {
    if (element && element.style) {
      element.style.outline = 'none';
      element.style.setProperty('outline', 'none', 'important');
      // Only remove box-shadow if it's not a backdrop blur element
      if (!element.className.includes('backdrop-blur') && !element.className.includes('blur-')) {
        element.style.boxShadow = 'none';
        element.style.setProperty('box-shadow', 'none', 'important');
      }
    }
  }
  
  // Apply to all current elements
  function applyToAll() {
    document.querySelectorAll('*').forEach(eliminateFocus);
  }
  
  // Event listeners for focus events
  document.addEventListener('focus', function(e) {
    eliminateFocus(e.target);
  }, true);
  
  document.addEventListener('focusin', function(e) {
    eliminateFocus(e.target);
  }, true);
  
  document.addEventListener('click', function(e) {
    eliminateFocus(e.target);
  }, true);
  
  // Apply immediately
  applyToAll();
  
  // Apply on DOM changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            eliminateFocus(node);
            node.querySelectorAll && node.querySelectorAll('*').forEach(eliminateFocus);
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Override any focus methods
  const originalFocus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function() {
    originalFocus.apply(this, arguments);
    eliminateFocus(this);
  };
  
})();