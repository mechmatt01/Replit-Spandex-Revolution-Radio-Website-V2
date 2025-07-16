import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useScrollVelocity, getAdaptiveAnimationDuration } from "@/hooks/use-scroll-velocity";
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
  duration = 300,
  className = '',
  direction = 'up'
}: FadeInViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [adaptiveDuration, setAdaptiveDuration] = useState(duration);
  const [elementId] = useState(() => `fade-${++animationCounter}`);
  const isVisible = useIntersectionObserver(ref, { 
    threshold, 
    rootMargin: '400px 0px -100px 0px' // Start animation 400px before element comes into view
  });
  const { velocity } = useScrollVelocity();

  useEffect(() => {
    if (isVisible && !hasAnimated && !animatedElements.has(elementId)) {
      // Calculate adaptive duration based on scroll velocity
      const newDuration = getAdaptiveAnimationDuration(duration, velocity, 300, 800);
      setAdaptiveDuration(newDuration);
      
      // Add minimal base delay plus reduced staggered delay based on element order
      const baseDelay = 50; // 0.05 seconds
      const staggerDelay = (animationCounter - 1) * 25; // 25ms between elements
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