import { useEffect, useRef, useState } from 'react';

interface ScrollingTextProps {
  text: string;
  className?: string;
  maxWidth?: string;
  style?: React.CSSProperties;
  isFloating?: boolean;
  backgroundColor?: string;
}

export default function ScrollingText({ text, className = '', maxWidth = '60%', style = {}, isFloating = false, backgroundColor }: ScrollingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.scrollWidth;
        const needsScroll = textWidth > containerWidth;
        setShouldScroll(needsScroll);
      }
    };

    // Small delay to ensure layout is complete
    const timer = setTimeout(checkOverflow, 100);
    window.addEventListener('resize', checkOverflow);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [text]);

  useEffect(() => {
    // Start scrolling if text overflows the container
    if (shouldScroll) {
      const timer = setTimeout(() => {
        setIsScrolling(true);
      }, 1000); // Start scrolling after 1 second
      
      return () => clearTimeout(timer);
    } else {
      setIsScrolling(false);
    }
  }, [text, shouldScroll]); // Reset scrolling when text changes

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
        className={`whitespace-nowrap ${isScrolling ? 'flex' : (isFloating ? 'text-left' : 'text-center')} ${
          isScrolling ? (isFloating ? 'animate-scroll-floating' : 'animate-scroll') : ''
        }`}
        style={{
          ...(isScrolling ? {} : { transform: 'translateX(0)' })
        }}
      >
        {isScrolling ? (
          <>
            <span className="mr-8">{text}</span>
            <span className="mr-8">{text}</span>
          </>
        ) : (
          <span>{text}</span>
        )}
      </div>
      
      {/* Fade edges */}
      {shouldScroll && (
        <>
          <div 
            className="absolute left-0 top-0 h-full w-12 pointer-events-none z-10"
            style={{
              background: `linear-gradient(to right, ${backgroundColor || 'var(--color-background)'}, transparent)`
            }}
          />
          <div 
            className="absolute right-0 top-0 h-full w-20 pointer-events-none z-10"
            style={{
              background: `linear-gradient(to left, ${backgroundColor || 'var(--color-background)'}, transparent)`
            }}
          />
        </>
      )}
    </div>
  );
}