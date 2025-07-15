import { useState, useEffect, useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function AnimatedCounter({
  value,
  duration = 800,
  className = "",
  style = {},
}: AnimatedCounterProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValueRef = useRef(value);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (previousValueRef.current !== value) {
      setIsAnimating(true);
      
      // Clear any existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      const startValue = previousValueRef.current;
      const endValue = value;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const currentAnimatedValue = Math.round(
          startValue + (endValue - startValue) * easeOut
        );
        
        setCurrentValue(currentAnimatedValue);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          previousValueRef.current = value;
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  // Create digit wheel animation effect
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      <div
        className={`transition-all duration-200 ${
          isAnimating ? "transform scale-110" : "transform scale-100"
        }`}
      >
        <span className="inline-block tabular-nums font-black">
          {formatNumber(currentValue)}
        </span>
      </div>
      
      {/* Subtle glow effect during animation */}
      {isAnimating && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 animate-pulse"
          style={{ 
            background: `linear-gradient(90deg, transparent, ${style.color || '#f97316'}, transparent)`,
            opacity: 0.3
          }}
        />
      )}
    </div>
  );
}