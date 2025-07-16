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
    <div className={`relative overflow-hidden ${className}`} style={{
      ...style,
      transition: 'color 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      willChange: 'color'
    }}>
      <div
        className={`transition-all duration-300 ${
          isAnimating ? "transform scale-105" : "transform scale-100"
        }`}
        style={{
          transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: 'transform'
        }}
      >
        <span className="inline-block tabular-nums font-black">
          {formatNumber(currentValue)}
        </span>
      </div>
      
      {/* Improved glow effect with better color transitions */}
      {isAnimating && (
        <div 
          className="absolute inset-0 opacity-30 animate-pulse"
          style={{ 
            background: `radial-gradient(circle, ${style.color || '#f97316'}40, transparent 70%)`,
            filter: 'blur(2px)',
            transition: 'opacity 0.4s ease-out'
          }}
        />
      )}
    </div>
  );
}