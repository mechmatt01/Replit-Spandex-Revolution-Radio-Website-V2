import { useEffect, useRef, useState } from 'react';

interface ScrollingTextProps {
  text: string;
  className?: string;
  maxWidth?: string;
  style?: React.CSSProperties;
  isFloating?: boolean;
}

export default function ScrollingText({ text, className = '', maxWidth = '60%', style = {}, isFloating = false }: ScrollingTextProps) {
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
    // Always start scrolling after a short delay
    const timer = setTimeout(() => {
      setIsScrolling(true);
    }, 1000); // Start scrolling after 1 second

    return () => clearTimeout(timer);
  }, [text]); // Reset scrolling when text changes

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
        className={`whitespace-nowrap flex ${
          isScrolling ? (isFloating ? 'animate-scroll-floating' : 'animate-scroll') : ''
        }`}
        style={{
          ...(isScrolling ? {} : { transform: 'translateX(0)' })
        }}
      >
        <span className="mr-8">{text}</span>
        <span className="mr-8">{text}</span>
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