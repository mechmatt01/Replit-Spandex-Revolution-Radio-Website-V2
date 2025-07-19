import { useEffect, useState } from 'react';
export function useIntersectionObserver(ref, options = {}) {
    const [isIntersecting, setIsIntersecting] = useState(false);
    useEffect(() => {
        const element = ref.current;
        if (!element)
            return;
        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, {
            threshold: options.threshold || 0.1,
            rootMargin: options.rootMargin || '0px',
            root: options.root || null,
        });
        observer.observe(element);
        return () => {
            observer.unobserve(element);
        };
    }, [ref, options.threshold, options.rootMargin, options.root]);
    return isIntersecting;
}
