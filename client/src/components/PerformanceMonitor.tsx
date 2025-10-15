import React, { useEffect, useState, useCallback } from 'react';

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  domLoad: number | null;
  windowLoad: number | null;
}

interface PerformanceMonitorProps {
  showMetrics?: boolean;
  logToConsole?: boolean;
}

export default function PerformanceMonitor({ 
  showMetrics = false, 
  logToConsole = true 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    domLoad: null,
    windowLoad: null
  });

  const updateMetrics = useCallback((newMetrics: Partial<PerformanceMetrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  }, []);

  useEffect(() => {
    if (!('PerformanceObserver' in window)) return;

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcp = entries[entries.length - 1];
      if (fcp) {
        const value = Math.round(fcp.startTime);
        updateMetrics({ fcp: value });
        if (logToConsole) console.log('FCP:', value + 'ms');
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcp = entries[entries.length - 1];
      if (lcp) {
        const value = Math.round(lcp.startTime);
        updateMetrics({ lcp: value });
        if (logToConsole) console.log('LCP:', value + 'ms');
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as PerformanceEventTiming;
        const value = Math.round(fidEntry.processingStart - fidEntry.startTime);
        updateMetrics({ fid: value });
        if (logToConsole) console.log('FID:', value + 'ms');
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      const value = Math.round(clsValue * 1000) / 1000;
      updateMetrics({ cls: value });
      if (logToConsole) console.log('CLS:', value);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // Navigation timing
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const ttfb = Math.round(navigationEntry.responseStart - navigationEntry.requestStart);
      const domLoad = Math.round(navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart);
      const windowLoad = Math.round(navigationEntry.loadEventEnd - navigationEntry.loadEventStart);
      
      updateMetrics({ ttfb, domLoad, windowLoad });
      if (logToConsole) {
        console.log('TTFB:', ttfb + 'ms');
        console.log('DOM Load:', domLoad + 'ms');
        console.log('Window Load:', windowLoad + 'ms');
      }
    }

    // Memory usage monitoring
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const checkMemory = () => {
        const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        const limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
        
        if (logToConsole) {
          console.log(`Memory: ${used}MB / ${total}MB (${limit}MB limit)`);
        }
        
        // Warn if memory usage is high
        if (used > limit * 0.8) {
          console.warn('High memory usage detected!');
        }
      };
      
      // Check memory every 30 seconds
      const memoryInterval = setInterval(checkMemory, 30000);
      checkMemory(); // Initial check
      
      return () => {
        clearInterval(memoryInterval);
        fcpObserver.disconnect();
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    }

    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, [updateMetrics, logToConsole]);

  // Performance optimization suggestions
  useEffect(() => {
    const suggestOptimizations = () => {
      const suggestions: string[] = [];
      
      if (metrics.fcp && metrics.fcp > 1800) {
        suggestions.push('First Contentful Paint is slow. Consider optimizing critical rendering path.');
      }
      
      if (metrics.lcp && metrics.lcp > 2500) {
        suggestions.push('Largest Contentful Paint is slow. Optimize images and reduce render-blocking resources.');
      }
      
      if (metrics.fid && metrics.fid > 100) {
        suggestions.push('First Input Delay is high. Reduce JavaScript execution time.');
      }
      
      if (metrics.cls && metrics.cls > 0.1) {
        suggestions.push('Cumulative Layout Shift is high. Avoid layout shifts during page load.');
      }
      
      if (suggestions.length > 0 && logToConsole) {
        console.group('Performance Optimization Suggestions:');
        suggestions.forEach(suggestion => console.log('•', suggestion));
        console.groupEnd();
      }
    };

    if (Object.values(metrics).some(metric => metric !== null)) {
      suggestOptimizations();
    }
  }, [metrics, logToConsole]);

  if (!showMetrics) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50">
      <div className="mb-2 font-bold">Performance Metrics</div>
      <div>FCP: {metrics.fcp ? `${metrics.fcp}ms` : '...'}</div>
      <div>LCP: {metrics.lcp ? `${metrics.lcp}ms` : '...'}</div>
      <div>FID: {metrics.fid ? `${metrics.fid}ms` : '...'}</div>
      <div>CLS: {metrics.cls ? metrics.cls : '...'}</div>
      <div>TTFB: {metrics.ttfb ? `${metrics.ttfb}ms` : '...'}</div>
    </div>
  );
}
