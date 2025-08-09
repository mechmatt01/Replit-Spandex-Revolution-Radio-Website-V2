import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
const StaggeredReveal = ({ children, delay = 0, staggerDelay = 50, className = '' }) => {
    const [visibleItems, setVisibleItems] = useState([]);
    const [hasStarted, setHasStarted] = useState(false);
    const containerRef = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !hasStarted) {
                setHasStarted(true);
                // Initialize visibility array
                setVisibleItems(new Array(children?.length || 0).fill(false));
                // Stagger the animations
                children.forEach((_, index) => {
                    setTimeout(() => {
                        setVisibleItems(prev => {
                            const newState = [...prev];
                            newState[index] = true;
                            return newState;
                        });
                    }, delay + (index * staggerDelay));
                });
            }
        }, {
            threshold: 0.05,
            rootMargin: '20px'
        });
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => observer.disconnect();
    }, [children?.length || 0, delay, staggerDelay, hasStarted]);
    return (_jsx("div", { ref: containerRef, className: className, children: children.map((child, index) => (_jsx("div", { className: `transform transition-all duration-200 ease-out ${visibleItems[index]
                ? 'translate-y-0 opacity-100 scale-100'
                : 'translate-y-4 opacity-0 scale-98'}`, children: child }, index))) }));
};
export default StaggeredReveal;
