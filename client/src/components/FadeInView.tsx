import { useIntersectionObserver } from "../hooks/use-intersection-observer";
import { useScrollVelocity, getAdaptiveAnimationDuration } from "../hooks/use-scroll-velocity";
import { useRef, ReactNode, useEffect, useState } from "react";

interface FadeInViewProps {
  children: ReactNode;
  threshold?: number;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

// Global state to track animated elements and ensure one-time animations
const animatedElements = new Set<string>();
let animationCounter = 0;

export default function FadeInView({
  children,
  threshold = 0.05,
  delay = 0,
  duration = 200,
  className = '',
  direction = 'up'
}: FadeInViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [adaptiveDuration, setAdaptiveDuration] = useState(duration);
  const [elementId] = useState(() => `fade-${++animationCounter}`);
  const isVisible = useIntersectionObserver(ref, { 
    threshold, 
    rootMargin: '100px 0px -20px 0px' // More conservative trigger to prevent gaps
  });
  const { velocity } = useScrollVelocity();

  useEffect(() => {
    if (isVisible && !hasAnimated && !animatedElements.has(elementId)) {
      // Calculate adaptive duration based on scroll velocity - faster for fast scrolling
      const newDuration = getAdaptiveAnimationDuration(duration, velocity, 100, 300);
      setAdaptiveDuration(newDuration);
      
      // Immediate animation for fast scrolling, minimal stagger for slow scrolling
      const isHighVelocity = Math.abs(velocity) > 500;
      const baseDelay = isHighVelocity ? 0 : 10; // No delay for fast scrolling
      const staggerDelay = isHighVelocity ? 0 : Math.min((animationCounter - 1) * 2, 20); // Minimal stagger, max 20ms
      const totalDelay = baseDelay + staggerDelay + delay;
      
      setTimeout(() => {
        if (!animatedElements.has(elementId)) {
          animatedElements.add(elementId);
          setHasAnimated(true);
        }
      }, totalDelay);
    }
  }, [isVisible, hasAnimated, elementId, delay, velocity, duration]);

  const getTransformStyle = (direction: string, hasAnimated: boolean) => {
    if (direction === 'none') return '';
    
    const transforms = {
      up: hasAnimated ? 'translateY(0)' : 'translateY(30px)',
      down: hasAnimated ? 'translateY(0)' : 'translateY(-30px)',
      left: hasAnimated ? 'translateX(0)' : 'translateX(30px)',
      right: hasAnimated ? 'translateX(0)' : 'translateX(-30px)'
    };
    
    return transforms[direction as keyof typeof transforms] || transforms.up;
  };

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${className}`}
      style={{
        opacity: hasAnimated ? 1 : 0,
        transform: getTransformStyle(direction, hasAnimated),
        transitionDuration: `${adaptiveDuration}ms`,
        transitionDelay: '0ms', // No CSS delay, handled by setTimeout
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </div>
  );
}