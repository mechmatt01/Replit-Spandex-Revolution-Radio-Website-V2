import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const AccessibilityContext = createContext(undefined);
export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within AccessibilityProvider');
    }
    return context;
}
export function AccessibilityProvider({ children }) {
    const [settings, setSettings] = useState({
        reduceMotion: false,
        highContrast: false,
        largeText: false,
        keyboardNavigation: true,
        screenReader: false,
    });
    // Detect user preferences from system
    useEffect(() => {
        const detectPreferences = () => {
            const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setSettings(prev => ({
                ...prev,
                reduceMotion: prefersReducedMotion,
                highContrast: isHighContrast,
            }));
            // Apply global CSS variables based on preferences
            document.documentElement.style.setProperty('--animation-duration', prefersReducedMotion ? '0.01ms' : '300ms');
            document.documentElement.style.setProperty('--transition-duration', prefersReducedMotion ? '0.01ms' : '200ms');
            if (isHighContrast) {
                document.documentElement.classList.add('high-contrast');
            }
            else {
                document.documentElement.classList.remove('high-contrast');
            }
        };
        detectPreferences();
        // Listen for changes in user preferences
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const contrastQuery = window.matchMedia('(prefers-contrast: high)');
        motionQuery.addEventListener('change', detectPreferences);
        contrastQuery.addEventListener('change', detectPreferences);
        return () => {
            motionQuery.removeEventListener('change', detectPreferences);
            contrastQuery.removeEventListener('change', detectPreferences);
        };
    }, []);
    // Screen reader detection
    useEffect(() => {
        const detectScreenReader = () => {
            // Check for common screen reader indicators
            const hasScreenReader = !!(navigator.userAgent.includes('NVDA') ||
                navigator.userAgent.includes('JAWS') ||
                navigator.userAgent.includes('VoiceOver') ||
                window.speechSynthesis);
            setSettings(prev => ({
                ...prev,
                screenReader: hasScreenReader
            }));
        };
        detectScreenReader();
    }, []);
    // Apply accessibility settings to DOM
    useEffect(() => {
        const root = document.documentElement;
        // Apply large text scaling
        if (settings.largeText) {
            root.style.fontSize = '120%';
            root.classList.add('large-text');
        }
        else {
            root.style.fontSize = '';
            root.classList.remove('large-text');
        }
        // Apply keyboard navigation focus styles
        if (settings.keyboardNavigation) {
            root.classList.add('keyboard-navigation');
            // Enhanced focus styles for keyboard navigation
            const style = document.getElementById('keyboard-focus-styles') || document.createElement('style');
            style.id = 'keyboard-focus-styles';
            style.textContent = `
        .keyboard-navigation *:focus {
          outline: 3px solid #f97316 !important;
          outline-offset: 2px !important;
        }
        .keyboard-navigation button:focus,
        .keyboard-navigation input:focus,
        .keyboard-navigation textarea:focus,
        .keyboard-navigation select:focus,
        .keyboard-navigation [role="button"]:focus,
        .keyboard-navigation [tabindex]:focus {
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.3) !important;
        }
      `;
            if (!document.getElementById('keyboard-focus-styles')) {
                document.head.appendChild(style);
            }
        }
        else {
            root.classList.remove('keyboard-navigation');
        }
        // Reduced motion CSS
        if (settings.reduceMotion) {
            const style = document.getElementById('reduced-motion-styles') || document.createElement('style');
            style.id = 'reduced-motion-styles';
            style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `;
            if (!document.getElementById('reduced-motion-styles')) {
                document.head.appendChild(style);
            }
        }
        else {
            const existingStyle = document.getElementById('reduced-motion-styles');
            if (existingStyle) {
                existingStyle.remove();
            }
        }
        // High contrast mode
        if (settings.highContrast) {
            root.classList.add('high-contrast');
            const style = document.getElementById('high-contrast-styles') || document.createElement('style');
            style.id = 'high-contrast-styles';
            style.textContent = `
        .high-contrast {
          filter: contrast(200%) !important;
        }
        .high-contrast * {
          background-color: white !important;
          color: black !important;
          /* border-color: black !important; */
        }
        .high-contrast button {
          background-color: black !important;
          color: white !important;
          /* border: 2px solid white !important; */
        }
        .high-contrast a {
          color: blue !important;
          text-decoration: underline !important;
        }
      `;
            if (!document.getElementById('high-contrast-styles')) {
                document.head.appendChild(style);
            }
        }
        else {
            root.classList.remove('high-contrast');
            const existingStyle = document.getElementById('high-contrast-styles');
            if (existingStyle) {
                existingStyle.remove();
            }
        }
    }, [settings]);
    const updateSetting = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };
    const announceToScreenReader = (message) => {
        // Create or update the live region for screen reader announcements
        let liveRegion = document.getElementById('aria-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'aria-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            document.body.appendChild(liveRegion);
        }
        // Clear and set new message
        liveRegion.textContent = '';
        setTimeout(() => {
            liveRegion.textContent = message;
        }, 100);
    };
    return (_jsx(AccessibilityContext.Provider, { value: {
            settings,
            updateSetting,
            announceToScreenReader
        }, children: children }));
}
// Custom hook for skip links - removed as requested
// Hook for managing focus
export function useFocusManagement() {
    const trapFocus = (element) => {
        const focusableElements = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const handleKeyDown = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                }
                else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
            if (e.key === 'Escape') {
                const closeButton = element.querySelector('[data-close]');
                if (closeButton) {
                    closeButton.click();
                }
            }
        };
        element.addEventListener('keydown', handleKeyDown);
        firstElement?.focus();
        return () => {
            element.removeEventListener('keydown', handleKeyDown);
        };
    };
    const restoreFocus = (element) => {
        const returnFocus = () => {
            element.focus();
        };
        return returnFocus;
    };
    return { trapFocus, restoreFocus };
}
