import { jsx as _jsx } from "react/jsx-runtime";
import { useIntersectionObserver } from "../hooks/use-intersection-observer";
import { useScrollVelocity, getAdaptiveAnimationDuration } from "../hooks/use-scroll-velocity";
import { useRef, useMemo, useCallback, useEffect } from "react";
// Global state to track animated elements and ensure one-time animations
const animatedFadeElements = new Set();
let fadeCounter = 0;
export default function FadeInView({ children, className = '', threshold = 0.1, direction = 'up', delay = 0, duration }) {
    const { ref, isVisible } = useIntersectionObserver({ threshold });
    const { velocity } = useScrollVelocity();
    const elementId = useRef(`fade-${++fadeCounter}`).current;
    // Memoize animation duration based on scroll velocity
    const animationDuration = useMemo(() => {
        if (duration)
            return duration;
        return getAdaptiveAnimationDuration(300, velocity); // 300ms baseline duration
    }, [duration, velocity]);
    // Memoize transform based on direction
    const transform = useMemo(() => {
        const transforms = {
            up: 'translateY(30px)',
            down: 'translateY(-30px)',
            left: 'translateX(30px)',
            right: 'translateX(-30px)'
        };
        return transforms[direction];
    }, [direction]);
    // Memoize styles to prevent unnecessary recalculations
    const styles = useMemo(() => {
        if (!isVisible || animatedFadeElements.has(elementId)) {
            return {
                opacity: 1,
                transform: 'translateY(0)',
                transition: 'none'
            };
        }
        return {
            opacity: 0,
            transform,
            transition: `opacity ${animationDuration}ms ease-out ${delay}ms, transform ${animationDuration}ms ease-out ${delay}ms`
        };
    }, [isVisible, elementId, transform, animationDuration, delay]);
    // Handle animation completion
    const handleTransitionEnd = useCallback(() => {
        if (isVisible && !animatedFadeElements.has(elementId)) {
            animatedFadeElements.add(elementId);
        }
    }, [isVisible, elementId]);
    // Apply styles when visibility changes
    useEffect(() => {
        if (isVisible && !animatedFadeElements.has(elementId)) {
            const element = ref.current;
            if (element) {
                // Use requestAnimationFrame to ensure smooth animation
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                });
            }
        }
    }, [isVisible, elementId, ref]);
    return (_jsx("div", { ref: ref, className: className, style: styles, onTransitionEnd: handleTransitionEnd, children: children }));
}
