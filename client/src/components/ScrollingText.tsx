import { useEffect, useRef, useState } from 'react';

interface ScrollingTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  maxWidth?: string;
  isFloating?: boolean;
  backgroundColor?: string;
  alignment?: 'left' | 'center';
}

export default function ScrollingText({ 
  text, 
  className = "", 
  style = {}, 
  maxWidth = "100%",
  isFloating = false,
  backgroundColor = "transparent",
  alignment = "center"
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

  // If text doesn't need scrolling, align based on alignment prop
  if (!shouldScroll) {
    return (
      <div 
        ref={containerRef}
        className={`flex overflow-hidden ${alignment === 'left' ? 'justify-start' : 'justify-center'}`}
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
        className={`transition-transform duration-1000 ease-linear ${className} whitespace-nowrap`}
        style={{
          ...style,
          transform: isScrolling && shouldScroll ? 'translateX(-100%)' : 'translateX(0)',
          animation: isScrolling && shouldScroll ? 'scroll-left 8s linear infinite' : 'none',
          display: 'inline-block',
          paddingRight: shouldScroll ? '100px' : '0',
          whiteSpace: 'nowrap'
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