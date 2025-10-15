import { useEffect, useRef, useState, useCallback } from 'react';
export function useIntersectionObserver({ threshold = 0.1, rootMargin = '0px' } = {}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const handleIntersection = useCallback((entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, stop observing
            if (ref.current) {
                entry.target.remove();
            }
        }
    }, []);
    useEffect(() => {
        const observer = new IntersectionObserver(handleIntersection, {
            threshold,
            rootMargin
        });
        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold, rootMargin, handleIntersection]);
    return { ref, isVisible };
}
