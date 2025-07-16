import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useRef, ReactNode, Children, cloneElement, ReactElement } from "react";

interface StaggeredAnimationProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  threshold?: number;
}

export default function StaggeredAnimation({
  children,
  staggerDelay = 100,
  className = '',
  direction = 'up',
  threshold = 0.1
}: StaggeredAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, { threshold });

  const getTransformStyle = (direction: string, isVisible: boolean) => {
    const transforms = {
      up: isVisible ? 'translateY(0)' : 'translateY(30px)',
      down: isVisible ? 'translateY(0)' : 'translateY(-30px)',
      left: isVisible ? 'translateX(0)' : 'translateX(30px)',
      right: isVisible ? 'translateX(0)' : 'translateX(-30px)'
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
            opacity: isVisible ? 1 : 0,
            transform: getTransformStyle(direction, isVisible),
            transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            transitionDelay: `${index * staggerDelay}ms`,
            willChange: 'opacity, transform'
          }
        });
      })}
    </div>
  );
}