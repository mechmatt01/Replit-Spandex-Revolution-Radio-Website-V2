import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useScrollVelocity, getAdaptiveAnimationDuration } from "@/hooks/use-scroll-velocity";
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
  staggerDelay = 100,
  className = '',
  direction = 'up',
  threshold = 0.05
}: StaggeredAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [adaptiveDuration, setAdaptiveDuration] = useState(600);
  const [adaptiveStaggerDelay, setAdaptiveStaggerDelay] = useState(staggerDelay);
  const [elementId] = useState(() => `stagger-${++staggerCounter}`);
  const isVisible = useIntersectionObserver(ref, { 
    threshold, 
    rootMargin: '200px 0px -50px 0px' // Start animation 200px before element comes into view
  });
  const { velocity } = useScrollVelocity();

  useEffect(() => {
    if (isVisible && !hasAnimated && !animatedStaggeredElements.has(elementId)) {
      // Calculate adaptive duration and stagger delay based on scroll velocity
      const newDuration = getAdaptiveAnimationDuration(600, velocity, 300, 800);
      const newStaggerDelay = getAdaptiveAnimationDuration(staggerDelay, velocity, 50, 150);
      
      setAdaptiveDuration(newDuration);
      setAdaptiveStaggerDelay(newStaggerDelay);
      
      // Add base 0.2s delay plus staggered delay based on element order
      const baseDelay = 200; // 0.2 seconds
      const groupDelay = (staggerCounter - 1) * 50; // 50ms between groups
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
      up: hasAnimated ? 'translateY(0)' : 'translateY(30px)',
      down: hasAnimated ? 'translateY(0)' : 'translateY(-30px)',
      left: hasAnimated ? 'translateX(0)' : 'translateX(30px)',
      right: hasAnimated ? 'translateX(0)' : 'translateX(-30px)'
    };
    
    return transforms[direction as keyof typeof transforms] || transforms.up;
  };

  const childrenArray = Children.toArray(children);

  return (
    <div ref={ref} className={className}>
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
            transition: `all ${adaptiveDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
            transitionDelay: hasAnimated ? `${index * adaptiveStaggerDelay}ms` : '0ms',
            willChange: 'opacity, transform'
          }
        });
      })}
    </div>
  );
}