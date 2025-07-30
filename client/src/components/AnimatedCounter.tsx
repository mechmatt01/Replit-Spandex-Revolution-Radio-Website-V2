import { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 800, className = "" }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [previousValue, setPreviousValue] = useState(0);

  useEffect(() => {
    if (value === previousValue) return;

    setPreviousValue(displayValue);
    
    const startValue = displayValue;
    const difference = value - startValue;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const currentValue = Math.round(startValue + difference * easeOutCubic(progress));
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration, displayValue, previousValue]);

  return (
    <span className={className}>
      {displayValue.toLocaleString()}
    </span>
  );
}