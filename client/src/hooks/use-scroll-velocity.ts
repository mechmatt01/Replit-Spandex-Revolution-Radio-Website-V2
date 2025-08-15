import { useEffect, useRef, useState, useCallback } from 'react';

export interface ScrollVelocityData {
  velocity: number;
  direction: 'up' | 'down' | 'none';
  isScrolling: boolean;
}

export function useScrollVelocity(): ScrollVelocityData {
  const [velocity, setVelocity] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down' | 'none'>('none');
  const [isScrolling, setIsScrolling] = useState(false);
  
  const lastScrollY = useRef(0);
  const lastTimestamp = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  const rafId = useRef<number>();
  const isThrottled = useRef(false);

  const handleScroll = useCallback(() => {
    if (isThrottled.current) return;
    
    isThrottled.current = true;
    
    rafId.current = requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const currentTimestamp = Date.now();
      
      // Calculate velocity (pixels per millisecond)
      const timeDelta = currentTimestamp - lastTimestamp.current;
      const scrollDelta = currentScrollY - lastScrollY.current;
      
      if (timeDelta > 0) {
        const currentVelocity = Math.abs(scrollDelta) / timeDelta;
        
        // Only update state if there's a significant change
        if (Math.abs(currentVelocity - velocity) > 0.1) {
          setVelocity(currentVelocity);
        }
        
        // Determine direction
        if (scrollDelta > 0) {
          setDirection('down');
        } else if (scrollDelta < 0) {
          setDirection('up');
        } else {
          setDirection('none');
        }
        
        setIsScrolling(true);
        
        // Clear existing timeout
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
        
        // Set scrolling to false after 100ms of no scroll
        scrollTimeout.current = setTimeout(() => {
          setIsScrolling(false);
          setVelocity(0);
          setDirection('none');
        }, 100);
      }
      
      lastScrollY.current = currentScrollY;
      lastTimestamp.current = currentTimestamp;
      
      isThrottled.current = false;
    });
  }, [velocity]);

  useEffect(() => {
    // Initialize
    lastScrollY.current = window.scrollY;
    lastTimestamp.current = Date.now();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleScroll]);

  return { velocity, direction, isScrolling };
}

// Helper function to calculate animation duration based on scroll velocity
export function getAdaptiveAnimationDuration(
  baselineDuration: number,
  velocity: number,
  minDuration: number = 150,
  maxDuration?: number
): number {
  // Define velocity thresholds
  const slowVelocity = 0.2;   // Slow scrolling
  const fastVelocity = 1.0;   // Fast scrolling
  
  let adaptiveDuration = baselineDuration;
  
  if (velocity > fastVelocity) {
    // Fast scrolling: reduce duration by up to 70%
    const speedMultiplier = Math.min(velocity / fastVelocity, 3);
    adaptiveDuration = baselineDuration * (0.3 + (0.7 / speedMultiplier));
  } else if (velocity > slowVelocity) {
    // Normal scrolling: use baseline duration
    adaptiveDuration = baselineDuration;
  } else {
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