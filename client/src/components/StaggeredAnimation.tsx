import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
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
  threshold = 0.1
}: StaggeredAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [elementId] = useState(() => `stagger-${++staggerCounter}`);
  const isVisible = useIntersectionObserver(ref, { threshold });

  useEffect(() => {
    if (isVisible && !hasAnimated && !animatedStaggeredElements.has(elementId)) {
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
  }, [isVisible, hasAnimated, elementId]);

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
            transition: `all 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
            transitionDelay: hasAnimated ? `${index * staggerDelay}ms` : '0ms',
            willChange: 'opacity, transform'
          }
        });
      })}
    </div>
  );
}