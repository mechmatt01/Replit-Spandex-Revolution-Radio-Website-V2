import { useEffect, useRef, useState } from 'react';

export function useScrollVelocity() {
  const [velocity, setVelocity] = useState(0);
  const lastScrollY = useRef(0);
  const lastTimestamp = useRef(0);

  useEffect(() => {
    let rafId: number;
    let timeoutId: number;

    const updateVelocity = () => {
      const currentScrollY = window.scrollY;
      const currentTimestamp = Date.now();
      
      const deltaY = Math.abs(currentScrollY - lastScrollY.current);
      const deltaTime = currentTimestamp - lastTimestamp.current;
      
      if (deltaTime > 0) {
        const currentVelocity = deltaY / deltaTime;
        setVelocity(currentVelocity);
      }
      
      lastScrollY.current = currentScrollY;
      lastTimestamp.current = currentTimestamp;
      
      // Clear velocity after no scroll for 100ms
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setVelocity(0), 100);
    };

    const handleScroll = () => {
      rafId = requestAnimationFrame(updateVelocity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, []);

  // Normalize velocity to animation duration multiplier
  // Fast scroll (velocity > 2) = 0.5x duration (faster)
  // Normal scroll (velocity 0.5-2) = 1x duration (normal)
  // Slow scroll (velocity < 0.5) = 1x duration (never slower)
  const getDurationMultiplier = () => {
    if (velocity > 2) return 0.5; // Fast scroll - speed up animations
    if (velocity > 0.5) return 1; // Normal scroll - normal timing
    return 1; // Slow/no scroll - normal timing (never slower)
  };

  return {
    velocity,
    durationMultiplier: getDurationMultiplier(),
    isScrolling: velocity > 0,
  };
}