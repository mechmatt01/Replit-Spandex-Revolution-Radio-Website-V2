import { useEffect, useState } from 'react';

export default function LoadingManager() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleComplete = () => {
      // Multi-stage loading completion for Safari mobile
      setTimeout(() => {
        document.body.classList.add('fully-loaded');
        setIsLoaded(true);
        
        // Dispatch custom event for any remaining loading indicators
        window.dispatchEvent(new CustomEvent('app-fully-loaded'));
      }, 100);
    };

    const handleAllResourcesLoaded = () => {
      // Check if all critical resources are loaded
      const checkResources = () => {
        const images = Array.from(document.images);
        const fonts = document.fonts;
        
        const imagesLoaded = images.every(img => img.complete && img.naturalHeight !== 0);
        const fontsLoaded = fonts.status === 'loaded';
        
        if (imagesLoaded && fontsLoaded) {
          handleComplete();
        } else {
          // Wait for remaining resources
          setTimeout(checkResources, 50);
        }
      };
      
      checkResources();
    };

    // Handle different loading states
    if (document.readyState === 'complete') {
      handleAllResourcesLoaded();
    } else if (document.readyState === 'interactive') {
      window.addEventListener('load', handleAllResourcesLoaded, { once: true });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        window.addEventListener('load', handleAllResourcesLoaded, { once: true });
      }, { once: true });
    }

    // Fallback timeout for Safari mobile
    const fallbackTimeout = setTimeout(() => {
      if (!isLoaded) {
        handleComplete();
      }
    }, 5000);

    return () => {
      clearTimeout(fallbackTimeout);
    };
  }, [isLoaded]);

  return null;
}