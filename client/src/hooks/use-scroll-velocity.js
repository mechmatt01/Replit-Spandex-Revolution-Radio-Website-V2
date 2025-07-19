import { useEffect, useRef, useState } from 'react';
export function useScrollVelocity() {
    const [velocity, setVelocity] = useState(0);
    const [direction, setDirection] = useState('none');
    const [isScrolling, setIsScrolling] = useState(false);
    const lastScrollY = useRef(0);
    const lastTimestamp = useRef(0);
    const scrollTimeout = useRef();
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const currentTimestamp = Date.now();
            // Calculate velocity (pixels per millisecond)
            const timeDelta = currentTimestamp - lastTimestamp.current;
            const scrollDelta = currentScrollY - lastScrollY.current;
            if (timeDelta > 0) {
                const currentVelocity = Math.abs(scrollDelta) / timeDelta;
                setVelocity(currentVelocity);
                // Determine direction
                if (scrollDelta > 0) {
                    setDirection('down');
                }
                else if (scrollDelta < 0) {
                    setDirection('up');
                }
                else {
                    setDirection('none');
                }
                setIsScrolling(true);
                // Clear existing timeout
                if (scrollTimeout.current) {
                    clearTimeout(scrollTimeout.current);
                }
                // Set scrolling to false after 150ms of no scroll
                scrollTimeout.current = setTimeout(() => {
                    setIsScrolling(false);
                    setVelocity(0);
                    setDirection('none');
                }, 150);
            }
            lastScrollY.current = currentScrollY;
            lastTimestamp.current = currentTimestamp;
        };
        // Initialize
        lastScrollY.current = window.scrollY;
        lastTimestamp.current = Date.now();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }
        };
    }, []);
    return { velocity, direction, isScrolling };
}
// Helper function to calculate animation duration based on scroll velocity
export function getAdaptiveAnimationDuration(baselineDuration, velocity, minDuration = 150, maxDuration) {
    // Define velocity thresholds
    const slowVelocity = 0.3; // Slow scrolling
    const fastVelocity = 1.5; // Fast scrolling
    let adaptiveDuration = baselineDuration;
    if (velocity > fastVelocity) {
        // Fast scrolling: reduce duration by up to 50%
        const speedMultiplier = Math.min(velocity / fastVelocity, 2);
        adaptiveDuration = baselineDuration * (0.5 + (0.5 / speedMultiplier));
    }
    else if (velocity > slowVelocity) {
        // Normal scrolling: use baseline duration
        adaptiveDuration = baselineDuration;
    }
    else {
        // Slow scrolling: use baseline duration (never slower)
        adaptiveDuration = baselineDuration;
    }
    // Ensure we don't go below minimum duration
    adaptiveDuration = Math.max(adaptiveDuration, minDuration);
    // Ensure we don't exceed maximum duration if specified
    if (maxDuration) {
        adaptiveDuration = Math.min(adaptiveDuration, maxDuration);
    }
    return Math.round(adaptiveDuration);
}
