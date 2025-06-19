import { useEffect, useRef, useState } from 'react';

interface ScrollingTextProps {
  text: string;
  className?: string;
  maxWidth?: string;
  style?: React.CSSProperties;
}

export default function ScrollingText({ text, className = '', maxWidth = '60%', style = {} }: ScrollingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.scrollWidth;
        setShouldScroll(textWidth > containerWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  useEffect(() => {
    if (shouldScroll) {
      const timer = setTimeout(() => {
        setIsScrolling(true);
      }, 2000); // Wait 2 seconds before starting to scroll

      return () => clearTimeout(timer);
    } else {
      setIsScrolling(false);
    }
  }, [shouldScroll]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ 
        width: maxWidth,
        ...style
      }}
    >
      <div
        ref={textRef}
        className={`whitespace-nowrap transition-transform duration-[8s] ease-linear ${
          isScrolling ? 'animate-scroll' : ''
        }`}
        style={{
          transform: isScrolling ? 'translateX(-100%)' : 'translateX(0)',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
          animationDelay: '2s'
        }}
      >
        {text}
      </div>
      
      {/* Fade edges */}
      {shouldScroll && (
        <>
          <div 
            className="absolute left-0 top-0 h-full w-8 pointer-events-none"
            style={{
              background: `linear-gradient(to right, ${style.color || 'currentColor'}00, transparent)`
            }}
          />
          <div 
            className="absolute right-0 top-0 h-full w-8 pointer-events-none"
            style={{
              background: `linear-gradient(to left, ${style.color || 'currentColor'}00, transparent)`
            }}
          />
        </>
      )}
    </div>
  );
}