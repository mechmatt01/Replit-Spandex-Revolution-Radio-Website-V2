import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useEffect, useState } from "react";
import { useIntersectionObserver } from "../hooks/use-intersection-observer";
import { useScrollVelocity, getAdaptiveAnimationDuration } from "../hooks/use-scroll-velocity";
// Global state to track animated elements and ensure one-time animations
const animatedElements = new Set();
let animationCounter = 0;
export default function FadeInView({ children, threshold = 0.05, delay = 0, duration = 100, className = '', direction = 'up' }) {
    const ref = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false);
    const [adaptiveDuration, setAdaptiveDuration] = useState(duration);
    const [elementId] = useState(() => `fade-${++animationCounter}`);
    const { ref: intersectionRef, isVisible } = useIntersectionObserver({
        threshold,
        rootMargin: '50px 0px -10px 0px' // Reduced margin for faster triggering
    });
    const { velocity } = useScrollVelocity();
    useEffect(() => {
        if (isVisible && !hasAnimated && !animatedElements.has(elementId)) {
            // Calculate adaptive duration based on scroll velocity - faster for fast scrolling
            const newDuration = getAdaptiveAnimationDuration(duration, velocity, 100, 300);
            setAdaptiveDuration(newDuration);
            // Immediate animation for fast scrolling, minimal stagger for slow scrolling
            const isHighVelocity = Math.abs(velocity) > 300;
            const baseDelay = isHighVelocity ? 0 : 5; // Minimal delay for fast scrolling
            const staggerDelay = isHighVelocity ? 0 : Math.min((animationCounter - 1) * 1, 10); // Minimal stagger, max 10ms
            const totalDelay = baseDelay + staggerDelay + delay;
            setTimeout(() => {
                if (!animatedElements.has(elementId)) {
                    animatedElements.add(elementId);
                    setHasAnimated(true);
                }
            }, totalDelay);
        }
    }, [isVisible, hasAnimated, elementId, delay, velocity, duration]);
    const getTransformStyle = (direction, hasAnimated) => {
        if (direction === 'none')
            return '';
        const transforms = {
            up: hasAnimated ? 'translateY(0)' : 'translateY(20px)',
            down: hasAnimated ? 'translateY(0)' : 'translateY(-20px)',
            left: hasAnimated ? 'translateX(0)' : 'translateX(20px)',
            right: hasAnimated ? 'translateX(0)' : 'translateX(-20px)'
        };
        return transforms[direction] || transforms.up;
    };
    return (_jsx("div", { ref: intersectionRef, className: `transition-all ease-out ${className}`, style: {
            opacity: hasAnimated ? 1 : 0,
            transform: getTransformStyle(direction, hasAnimated),
            transitionDuration: `${adaptiveDuration}ms`,
            transitionDelay: '0ms', // No CSS delay, handled by setTimeout
            willChange: 'opacity, transform'
        }, children: children }));
}
