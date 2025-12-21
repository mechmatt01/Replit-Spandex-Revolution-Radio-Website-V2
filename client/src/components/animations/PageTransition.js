import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
const PageTransition = ({ children, className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const elementRef = useRef(null);
    const { colors } = useTheme();
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !hasAnimated) {
                setIsVisible(true);
                setHasAnimated(true);
            }
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        if (elementRef.current) {
            observer.observe(elementRef.current);
        }
        return () => observer.disconnect();
    }, [hasAnimated]);
    return (_jsx("div", { ref: elementRef, className: `transform transition-all duration-500 ease-out ${isVisible
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-8 opacity-0 scale-95'} ${className}`, children: children }));
};
export default PageTransition;
