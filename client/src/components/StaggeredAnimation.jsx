import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useScrollVelocity, getAdaptiveAnimationDuration } from "@/hooks/use-scroll-velocity";
import { useRef, Children, cloneElement, useEffect, useState } from "react";
// Global state to track animated elements and ensure one-time animations
const animatedStaggeredElements = new Set();
let staggerCounter = 0;
export default function StaggeredAnimation({ children, staggerDelay = 50, className = '', direction = 'up', threshold = 0.05 }) {
    const ref = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false);
    const [adaptiveDuration, setAdaptiveDuration] = useState(300);
    const [adaptiveStaggerDelay, setAdaptiveStaggerDelay] = useState(staggerDelay);
    const [elementId] = useState(() => `stagger-${++staggerCounter}`);
    const isVisible = useIntersectionObserver(ref, {
        threshold,
        rootMargin: '400px 0px -100px 0px' // Start animation 400px before element comes into view
    });
    const { velocity } = useScrollVelocity();
    useEffect(() => {
        if (isVisible && !hasAnimated && !animatedStaggeredElements.has(elementId)) {
            // Calculate adaptive duration and stagger delay based on scroll velocity
            const newDuration = getAdaptiveAnimationDuration(300, velocity, 150, 400);
            const newStaggerDelay = getAdaptiveAnimationDuration(staggerDelay, velocity, 25, 75);
            setAdaptiveDuration(newDuration);
            setAdaptiveStaggerDelay(newStaggerDelay);
            // Add minimal base delay plus reduced staggered delay based on element order
            const baseDelay = 50; // 0.05 seconds
            const groupDelay = (staggerCounter - 1) * 25; // 25ms between groups
            const totalDelay = baseDelay + groupDelay;
            setTimeout(() => {
                if (!animatedStaggeredElements.has(elementId)) {
                    animatedStaggeredElements.add(elementId);
                    setHasAnimated(true);
                }
            }, totalDelay);
        }
    }, [isVisible, hasAnimated, elementId, velocity, staggerDelay]);
    const getTransformStyle = (direction, hasAnimated) => {
        const transforms = {
            up: hasAnimated ? 'translateY(0)' : 'translateY(30px)',
            down: hasAnimated ? 'translateY(0)' : 'translateY(-30px)',
            left: hasAnimated ? 'translateX(0)' : 'translateX(30px)',
            right: hasAnimated ? 'translateX(0)' : 'translateX(-30px)'
        };
        return transforms[direction] || transforms.up;
    };
    const childrenArray = Children.toArray(children);
    return (<div ref={ref} className={className}>
      {childrenArray.map((child, index) => {
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
                    transition: `all ${adaptiveDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${hasAnimated ? `${index * adaptiveStaggerDelay}ms` : '0ms'}`,
                    willChange: 'opacity, transform'
                }
            });
        })}
    </div>);
}
