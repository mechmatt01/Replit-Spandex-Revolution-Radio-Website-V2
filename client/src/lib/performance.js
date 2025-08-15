// Performance optimization utilities
export const preloadCriticalResources = () => {
    // Preload critical fonts
    const fontLink = document.createElement("link");
    fontLink.rel = "preload";
    fontLink.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap";
    fontLink.as = "style";
    fontLink.crossOrigin = "";
    document.head.appendChild(fontLink);
    // Preload critical API endpoints
    const apiEndpoints = [
        "/api/now-playing",
        "/api/radio-status",
        "/api/stream-stats",
    ];
    apiEndpoints.forEach((endpoint) => {
        fetch(endpoint, { method: "HEAD" }).catch(() => { });
    });
};
export const optimizeImages = () => {
    // Lazy load images below the fold
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    images.forEach((img) => imageObserver.observe(img));
};
export const optimizeAnimations = () => {
    // Reduce motion for users who prefer it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        document.documentElement.style.setProperty('--transition-duration', '0.01ms');
    }
    // Optimize CSS animations
    const style = document.createElement('style');
    style.textContent = `
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
  `;
    document.head.appendChild(style);
};
export const optimizeScrolling = () => {
    // Use passive event listeners for better scroll performance
    let ticking = false;
    const updateScroll = () => {
        // Handle scroll-based animations efficiently
        ticking = false;
    };
    const requestTick = () => {
        if (!ticking) {
            requestAnimationFrame(updateScroll);
            ticking = true;
        }
    };
    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick, { passive: true });
};
export const optimizeNetworkRequests = () => {
    // Implement request deduplication
    const pendingRequests = new Map();
    const deduplicateRequest = async (url, options = {}) => {
        if (pendingRequests.has(url)) {
            return pendingRequests.get(url);
        }
        const promise = fetch(url, options);
        pendingRequests.set(url, promise);
        try {
            const response = await promise;
            pendingRequests.delete(url);
            return response;
        }
        catch (error) {
            pendingRequests.delete(url);
            throw error;
        }
    };
    return { deduplicateRequest };
};
export const optimizeMemoryUsage = () => {
    // Clean up event listeners and references
    const cleanupFunctions = [];
    const addCleanup = (cleanup) => {
        cleanupFunctions.push(cleanup);
    };
    const cleanup = () => {
        cleanupFunctions.forEach(fn => fn());
        cleanupFunctions.length = 0;
    };
    // Clean up on page unload
    window.addEventListener('beforeunload', cleanup);
    return { addCleanup, cleanup };
};
export const optimizeCriticalCSS = () => {
    // Inline critical CSS for above-the-fold content
    const criticalCSS = `
    .critical-content {
      opacity: 1 !important;
      visibility: visible !important;
      transform: none !important;
    }
    
    .non-critical {
      opacity: 0;
      visibility: hidden;
    }
  `;
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    style.setAttribute('data-critical', 'true');
    document.head.appendChild(style);
    // Load non-critical CSS asynchronously
    const nonCriticalCSS = document.createElement('link');
    nonCriticalCSS.rel = 'stylesheet';
    nonCriticalCSS.href = '/non-critical.css';
    nonCriticalCSS.media = 'print';
    nonCriticalCSS.onload = () => {
        nonCriticalCSS.media = 'all';
    };
    document.head.appendChild(nonCriticalCSS);
};
export const optimizeImagesAdvanced = () => {
    // Convert images to WebP format for better performance
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
        const imgElement = img;
        const src = imgElement.getAttribute('src');
        if (src) {
            const webpSrc = src.replace(/\.(jpg|png)$/, '.webp');
            imgElement.setAttribute('data-webp', webpSrc);
            // Load WebP version
            const webpImg = new Image();
            webpImg.onload = () => {
                imgElement.src = webpSrc;
            };
            webpImg.src = webpSrc;
        }
    });
    // Responsive images with srcset
    const responsiveImages = document.querySelectorAll('img[data-srcset]');
    responsiveImages.forEach((img) => {
        const imgElement = img;
        const srcset = imgElement.getAttribute('data-srcset');
        if (srcset) {
            imgElement.srcset = srcset;
            imgElement.sizes = imgElement.getAttribute('data-sizes') || '100vw';
        }
    });
};
export const optimizeFonts = () => {
    // Font display swap for better performance
    const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    fontLinks.forEach((link) => {
        const linkElement = link;
        if (!linkElement.href.includes('&display=swap')) {
            linkElement.href += '&display=swap';
        }
    });
    // Preload critical font files
    const criticalFonts = [
        '/fonts/Orbitron-Bold.woff2',
        '/fonts/Orbitron-Regular.woff2'
    ];
    criticalFonts.forEach((font) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = font;
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    });
};
export const optimizeThirdPartyScripts = () => {
    // Defer non-critical third-party scripts
    const thirdPartyScripts = document.querySelectorAll('script[data-defer]');
    thirdPartyScripts.forEach((script) => {
        script.setAttribute('defer', '');
        script.removeAttribute('data-defer');
    });
    // Load analytics scripts after page load
    const analyticsScripts = document.querySelectorAll('script[data-analytics]');
    analyticsScripts.forEach((script) => {
        window.addEventListener('load', () => {
            const newScript = document.createElement('script');
            newScript.src = script.getAttribute('src') || '';
            newScript.async = true;
            document.head.appendChild(newScript);
        });
    });
};
export const initializePerformanceOptimizations = () => {
    // Initialize all performance optimizations
    preloadCriticalResources();
    optimizeImages();
    optimizeAnimations();
    optimizeScrolling();
    optimizeCriticalCSS();
    optimizeImagesAdvanced();
    optimizeFonts();
    optimizeThirdPartyScripts();
    // Monitor performance metrics
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'largest-contentful-paint') {
                    console.log('LCP:', entry.startTime);
                }
                if (entry.entryType === 'first-input-delay') {
                    console.log('FID:', entry.startTime);
                }
            });
        });
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input-delay'] });
    }
};
