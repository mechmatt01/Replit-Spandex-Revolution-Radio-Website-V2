import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useScrollVelocity } from "@/hooks/use-scroll-velocity";
import { useRef, ReactNode } from "react";

interface FadeInViewProps {
  children: ReactNode;
  threshold?: number;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export default function FadeInView({
  children,
  threshold = 0.1,
  delay = 0,
  duration = 600,
  className = '',
  direction = 'up'
}: FadeInViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, { threshold });
  const { durationMultiplier } = useScrollVelocity();
  
  const adaptiveDuration = duration * durationMultiplier;
  const adaptiveDelay = delay * durationMultiplier;

  const getTransformStyle = (direction: string, isVisible: boolean) => {
    if (direction === 'none') return '';
    
    const transforms = {
      up: isVisible ? 'translateY(0)' : 'translateY(30px)',
      down: isVisible ? 'translateY(0)' : 'translateY(-30px)',
      left: isVisible ? 'translateX(0)' : 'translateX(30px)',
      right: isVisible ? 'translateX(0)' : 'translateX(-30px)'
    };
    
    return transforms[direction as keyof typeof transforms] || transforms.up;
  };

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransformStyle(direction, isVisible),
        transitionDuration: `${adaptiveDuration}ms`,
        transitionDelay: `${adaptiveDelay}ms`,
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </div>
  );
}