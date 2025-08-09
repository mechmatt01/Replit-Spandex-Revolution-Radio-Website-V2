import { useEffect, useRef, useState } from 'react';
export function useIntersectionObserver({ threshold = 0.1, rootMargin = '0px' } = {}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                // Once visible, stop observing
                if (ref.current) {
                    observer.unobserve(ref.current);
                }
            }
        }, {
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
    }, [threshold, rootMargin]);
    return { ref, isVisible };
}
