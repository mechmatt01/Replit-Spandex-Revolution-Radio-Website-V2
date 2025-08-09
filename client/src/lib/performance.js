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
    const images = document.querySelectorAll("img[data-src]");
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || "";
                img.classList.remove("opacity-0");
                img.classList.add("opacity-100");
                imageObserver.unobserve(img);
            }
        });
    });
    images.forEach((img) => imageObserver.observe(img));
};
export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
export const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};
// Optimize API polling
export const createOptimizedPoller = (callback, interval) => {
    let isVisible = true;
    let pollInterval;
    const handleVisibilityChange = () => {
        isVisible = !document.hidden;
        if (isVisible && !pollInterval) {
            startPolling();
        }
        else if (!isVisible && pollInterval) {
            stopPolling();
        }
    };
    const startPolling = () => {
        callback();
        pollInterval = setInterval(callback, interval);
    };
    const stopPolling = () => {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    startPolling();
    return {
        stop: () => {
            stopPolling();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        },
    };
};
