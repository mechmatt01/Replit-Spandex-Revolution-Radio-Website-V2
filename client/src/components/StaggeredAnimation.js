import { jsx as _jsx } from "react/jsx-runtime";
import { useIntersectionObserver } from "../hooks/use-intersection-observer";
import { useScrollVelocity, getAdaptiveAnimationDuration } from "../hooks/use-scroll-velocity";
import { useRef, Children, cloneElement, useEffect, useState, useCallback, useMemo } from "react";
// Global state to track animated elements and ensure one-time animations
const animatedStaggeredElements = new Set();
let staggerCounter = 0;
export default function StaggeredAnimation({ children, staggerDelay = 50, className = '', direction = 'up', threshold = 0.05 }) {
    const ref = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false);
    const [elementId] = useState(() => `stagger-${++staggerCounter}`);
    const { ref: intersectionRef, isVisible } = useIntersectionObserver({
        threshold,
        rootMargin: '50px 0px -25px 0px'
    });
    const { velocity } = useScrollVelocity();
    // Memoize animation values to prevent recalculation
    const animationValues = useMemo(() => {
        if (!hasAnimated)
            return null;
        const adaptiveDuration = getAdaptiveAnimationDuration(150, velocity, 100, 250);
        const adaptiveStaggerDelay = getAdaptiveAnimationDuration(staggerDelay, velocity, 15, 50);
        return { adaptiveDuration, adaptiveStaggerDelay };
    }, [hasAnimated, velocity, staggerDelay]);
    useEffect(() => {
        if (isVisible && !hasAnimated && !animatedStaggeredElements.has(elementId)) {
            // Minimal delay for faster loading
            const totalDelay = (staggerCounter - 1) * 5;
            const timer = setTimeout(() => {
                if (!animatedStaggeredElements.has(elementId)) {
                    animatedStaggeredElements.add(elementId);
                    setHasAnimated(true);
                }
            }, totalDelay);
            return () => clearTimeout(timer);
        }
    }, [isVisible, hasAnimated, elementId]);
    const getTransformStyle = useCallback((direction, hasAnimated) => {
        const transforms = {
            up: hasAnimated ? 'translateY(0)' : 'translateY(20px)',
            down: hasAnimated ? 'translateY(0)' : 'translateY(-20px)',
            left: hasAnimated ? 'translateX(0)' : 'translateX(20px)',
            right: hasAnimated ? 'translateX(0)' : 'translateX(-20px)'
        };
        return transforms[direction] || transforms.up;
    }, []);
    const childrenArray = useMemo(() => Children.toArray(children), [children]);
    if (!animationValues) {
        return (_jsx("div", { ref: intersectionRef, className: className, children: childrenArray.map((child, index) => {
                if (!child || typeof child !== 'object')
                    return child;
                const element = child;
                return cloneElement(element, {
                    ...element.props,
                    key: element.key || index,
                    style: {
                        ...element.props.style,
                        opacity: 0,
                        transform: getTransformStyle(direction, false),
                        willChange: 'opacity, transform'
                    }
                });
            }) }));
    }
    return (_jsx("div", { ref: intersectionRef, className: className, children: childrenArray.map((child, index) => {
            if (!child || typeof child !== 'object')
                return child;
            const element = child;
            return cloneElement(element, {
                ...element.props,
                key: element.key || index,
                style: {
                    ...element.props.style,
                    opacity: hasAnimated ? 1 : 0,
                    transform: getTransformStyle(direction, hasAnimated),
                    transition: `all ${animationValues.adaptiveDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${hasAnimated ? `${index * animationValues.adaptiveStaggerDelay}ms` : '0ms'}`,
                    willChange: 'opacity, transform'
                }
            });
        }) }));
}
