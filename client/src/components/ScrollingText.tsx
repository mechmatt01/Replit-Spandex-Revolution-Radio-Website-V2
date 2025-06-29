import { useEffect, useRef, useState } from 'react';

interface ScrollingTextProps {
  text: string;
  className?: string;
  maxWidth?: string;
  style?: React.CSSProperties;
  isFloating?: boolean;
  backgroundColor?: string;
}

export default function ScrollingText({ 
  text, 
  className = "", 
  style = {},
  maxWidth = "100%",
  backgroundColor = "transparent"
}: ScrollingTextProps) {
  const [isScrolling, setIsScrolling] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current && containerRef.current) {
        const textWidth = textRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        const needsScrolling = textWidth > containerWidth;
        setShouldScroll(needsScrolling);

        // If text fits, center it and don't scroll
        if (!needsScrolling) {
          setIsScrolling(false);
        }
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
      }, 1000); // Wait 1 second before starting to scroll

      return () => clearTimeout(timer);
    } else {
      setIsScrolling(false);
    }
  }, [shouldScroll]);

  // If text doesn't need scrolling, just center it
  if (!shouldScroll) {
    return (
      <div 
        ref={containerRef}
        className="flex justify-center overflow-hidden"
        style={{ maxWidth, backgroundColor }}
      >
        <div
          ref={textRef}
          className={className}
          style={style}
        >
          {text}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden whitespace-nowrap"
      style={{ maxWidth, backgroundColor }}
    >
      <div
        ref={textRef}
        className={`transition-transform duration-1000 ease-linear ${className}`}
        style={{
          ...style,
          transform: isScrolling && shouldScroll ? 'translateX(-100%)' : 'translateX(0)',
          animation: isScrolling && shouldScroll ? 'scroll-left 8s linear infinite' : 'none',
          display: 'inline-block',
          paddingRight: shouldScroll ? '100px' : '0'
        }}
      >
        {text}
        {shouldScroll && (
          <span style={{ paddingLeft: '100px' }}>{text}</span>
        )}
      </div>
    </div>
  );
}