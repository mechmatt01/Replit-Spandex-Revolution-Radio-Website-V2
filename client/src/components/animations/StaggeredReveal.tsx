import React, { useState, useEffect, useRef } from 'react';

interface StaggeredRevealProps {
  children: React.ReactNode[];
  delay?: number;
  staggerDelay?: number;
  className?: string;
}

const StaggeredReveal: React.FC<StaggeredRevealProps> = ({
  children,
  delay = 0,
  staggerDelay = 100,
  className = ''
}) => {
  const [visibleItems, setVisibleItems] = useState<boolean[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          
          // Initialize visibility array
          setVisibleItems(new Array(children?.length || 0).fill(false));
          
          // Stagger the animations
          children.forEach((_, index) => {
            const timeout = setTimeout(() => {
              setVisibleItems(prev => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
              });
            }, delay + (index * staggerDelay));
            
            timeouts.push(timeout);
          });
        }
      },
      {
        threshold: 0.1,
        rootMargin: '30px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      // Clear all timeouts on cleanup
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [children?.length || 0, delay, staggerDelay, hasStarted]);

  return (
    <div ref={containerRef} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={`transform transition-all duration-400 ease-out ${
            visibleItems[index]
              ? 'translate-y-0 opacity-100 scale-100'
              : 'translate-y-6 opacity-0 scale-95'
          }`}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default StaggeredReveal;