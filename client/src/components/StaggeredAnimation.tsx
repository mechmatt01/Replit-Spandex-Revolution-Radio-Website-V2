import { useIntersectionObserver } from "../hooks/use-intersection-observer";
import { useScrollVelocity, getAdaptiveAnimationDuration } from "../hooks/use-scroll-velocity";
import { useRef, ReactNode, Children, cloneElement, ReactElement, useEffect, useState } from "react";

interface StaggeredAnimationProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  threshold?: number;
}

// Global state to track animated elements and ensure one-time animations
const animatedStaggeredElements = new Set<string>();
let staggerCounter = 0;

export default function StaggeredAnimation({
  children,
  staggerDelay = 50,
  className = '',
  direction = 'up',
  threshold = 0.05
}: StaggeredAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [adaptiveDuration, setAdaptiveDuration] = useState(150);
  const [adaptiveStaggerDelay, setAdaptiveStaggerDelay] = useState(staggerDelay);
  const [elementId] = useState(() => `stagger-${++staggerCounter}`);
  const { ref: intersectionRef, isVisible } = useIntersectionObserver({ 
    threshold, 
    rootMargin: '100px 0px -25px 0px' // Start animation 100px before element comes into view (faster trigger)
  });
  const { velocity } = useScrollVelocity();

  useEffect(() => {
    if (isVisible && !hasAnimated && !animatedStaggeredElements.has(elementId)) {
      // Calculate adaptive duration and stagger delay based on scroll velocity
      const newDuration = getAdaptiveAnimationDuration(150, velocity, 100, 250);
      const newStaggerDelay = getAdaptiveAnimationDuration(staggerDelay, velocity, 15, 50);
      
      setAdaptiveDuration(newDuration);
      setAdaptiveStaggerDelay(newStaggerDelay);
      
      // Add minimal base delay plus reduced staggered delay based on element order
      const baseDelay = 0; // Immediate start for faster loading
      const groupDelay = (staggerCounter - 1) * 5; // 5ms between groups (faster)
      const totalDelay = baseDelay + groupDelay;
      
      setTimeout(() => {
        if (!animatedStaggeredElements.has(elementId)) {
          animatedStaggeredElements.add(elementId);
          setHasAnimated(true);
        }
      }, totalDelay);
    }
  }, [isVisible, hasAnimated, elementId, velocity, staggerDelay]);

  const getTransformStyle = (direction: string, hasAnimated: boolean) => {
    const transforms = {
      up: hasAnimated ? 'translateY(0)' : 'translateY(20px)',
      down: hasAnimated ? 'translateY(0)' : 'translateY(-20px)',
      left: hasAnimated ? 'translateX(0)' : 'translateX(20px)',
      right: hasAnimated ? 'translateX(0)' : 'translateX(-20px)'
    };
    
    return transforms[direction as keyof typeof transforms] || transforms.up;
  };

  const childrenArray = Children.toArray(children);

  return (
    <div ref={intersectionRef} className={className}>
      {childrenArray.map((child, index) => {
        if (!child || typeof child !== 'object') return child;
        
        const element = child as ReactElement;
        
        return cloneElement(element, {
          ...element.props,
          key: element.key || index,
          style: {
            ...element.props.style,
            opacity: hasAnimated ? 1 : 0,
            transform: getTransformStyle(direction, hasAnimated),
            transition: `all ${adaptiveDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${hasAnimated ? `${index * adaptiveStaggerDelay}ms` : '0ms'}`,
            willChange: 'opacity, transform'
          }
        });
      })}
    </div>
  );
}