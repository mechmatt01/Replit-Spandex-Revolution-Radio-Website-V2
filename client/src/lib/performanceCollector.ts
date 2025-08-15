import { performance } from '../firebase';
import { trace, Trace } from 'firebase/performance';

// Performance data storage
interface PerformanceEvent {
  id: string;
  type: 'page_load' | 'api_request' | 'component_render' | 'error' | 'custom_trace';
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata: Record<string, any>;
  userId?: string;
  sessionId: string;
  userAgent: string;
  url: string;
}

interface PerformanceMetrics {
  pageLoads: Map<string, PerformanceEvent[]>;
  apiRequests: Map<string, PerformanceEvent[]>;
  componentRenders: Map<string, PerformanceEvent[]>;
  errors: Map<string, PerformanceEvent[]>;
  customTraces: Map<string, PerformanceEvent[]>;
}

class PerformanceCollector {
  private metrics: PerformanceMetrics;
  private sessionId: string;
  private userId?: string;
  private isCollecting: boolean = false;
  private collectionInterval?: NodeJS.Timeout;
  private observers: Set<(metrics: PerformanceMetrics) => void> = new Set();

  constructor() {
    this.metrics = {
      pageLoads: new Map(),
      apiRequests: new Map(),
      componentRenders: new Map(),
      errors: new Map(),
      customTraces: new Map()
    };
    
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    
    // Start collecting performance data
    this.startCollection();
    
    // Set up automatic data cleanup
    this.setupDataCleanup();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string | undefined {
    // Get user ID from localStorage or other auth state
    try {
      const userData = localStorage.getItem('firebase:authUser:AIzaSyCBoEZeDucpm7p9OEDgaUGLzhn5HpItseQ:[DEFAULT]');
      if (userData) {
        const user = JSON.parse(userData);
        return user.uid;
      }
    } catch (error) {
      console.debug('Could not get user ID for performance tracking');
    }
    return undefined;
  }

  private startCollection(): void {
    if (this.isCollecting) return;
    
    this.isCollecting = true;
    
    // Collect data every 10 seconds
    this.collectionInterval = setInterval(() => {
      this.collectPerformanceData();
    }, 10000);
    
    // Collect initial data
    this.collectPerformanceData();
    
    console.log('Performance data collection started');
  }

  private stopCollection(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = undefined;
    }
    this.isCollecting = false;
    console.log('Performance data collection stopped');
  }

  private collectPerformanceData(): void {
    // Collect Core Web Vitals
    this.collectCoreWebVitals();
    
    // Collect navigation timing
    this.collectNavigationTiming();
    
    // Collect resource timing
    this.collectResourceTiming();
    
    // Collect memory usage (if available)
    this.collectMemoryUsage();
    
    // Notify observers
    this.notifyObservers();
  }

  private collectCoreWebVitals(): void {
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.recordEvent('page_load', 'LCP', lastEntry.startTime, 'ms', {
              element: lastEntry.element?.tagName || 'unknown',
              size: lastEntry.size || 0,
              url: lastEntry.url || window.location.href
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.recordEvent('page_load', 'FID', entry.processingStart - entry.startTime, 'ms', {
              name: entry.name,
              type: entry.entryType
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          let clsValue = 0;
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });
          this.recordEvent('page_load', 'CLS', clsValue, 'score', {
            entries: entries.length
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.debug('Core Web Vitals collection failed:', error);
      }
    }
  }

  private collectNavigationTiming(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      try {
        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
          const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
          
          // Page load time
          this.recordEvent('page_load', 'Page Load', navEntry.loadEventEnd - navEntry.loadEventStart, 'ms', {
            url: window.location.href,
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            firstPaint: navEntry.loadEventEnd - navEntry.loadEventStart
          });
          
          // DNS lookup time
          this.recordEvent('page_load', 'DNS Lookup', navEntry.domainLookupEnd - navEntry.domainLookupStart, 'ms', {
            url: window.location.href
          });
          
          // Connection time
          this.recordEvent('page_load', 'Connection', navEntry.connectEnd - navEntry.connectStart, 'ms', {
            url: window.location.href
          });
        }
      } catch (error) {
        console.debug('Navigation timing collection failed:', error);
      }
    }
  }

  private collectResourceTiming(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      try {
        const resourceEntries = performance.getEntriesByType('resource');
        resourceEntries.forEach(entry => {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Only track API requests and important resources
          if (resourceEntry.name.includes('/api/') || 
              resourceEntry.name.includes('.js') || 
              resourceEntry.name.includes('.css') ||
              resourceEntry.name.includes('.png') ||
              resourceEntry.name.includes('.jpg') ||
              resourceEntry.name.includes('.svg')) {
            
            this.recordEvent('api_request', resourceEntry.name, resourceEntry.responseEnd - resourceEntry.requestStart, 'ms', {
              initiatorType: resourceEntry.initiatorType,
              transferSize: resourceEntry.transferSize,
              decodedBodySize: resourceEntry.decodedBodySize,
              url: resourceEntry.name
            });
          }
        });
      } catch (error) {
        console.debug('Resource timing collection failed:', error);
      }
    }
  }

  private collectMemoryUsage(): void {
    if ('memory' in performance) {
      try {
        const memory = (performance as any).memory;
        this.recordEvent('custom_trace', 'Memory Usage', memory.usedJSHeapSize, 'bytes', {
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usedJSHeapSize: memory.usedJSHeapSize
        });
      } catch (error) {
        console.debug('Memory usage collection failed:', error);
      }
    }
  }

  public recordEvent(
    type: PerformanceEvent['type'],
    name: string,
    value: number,
    unit: string,
    metadata: Record<string, any> = {}
  ): void {
    const event: PerformanceEvent = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      name,
      value,
      unit,
      timestamp: new Date(),
      metadata,
      userId: this.userId,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store event in appropriate category
    const categoryMap = this.getCategoryMap(type);
    if (categoryMap) {
      const key = this.getEventKey(event);
      if (!categoryMap.has(key)) {
        categoryMap.set(key, []);
      }
      categoryMap.get(key)!.push(event);
      
      // Keep only last 100 events per category to prevent memory issues
      if (categoryMap.get(key)!.length > 100) {
        categoryMap.get(key)!.shift();
      }
    }

    // Send to Firebase Performance Monitoring
    this.sendToFirebase(event);
  }

  private getCategoryMap(type: PerformanceEvent['type']): Map<string, PerformanceEvent[]> | null {
    switch (type) {
      case 'page_load':
        return this.metrics.pageLoads;
      case 'api_request':
        return this.metrics.apiRequests;
      case 'component_render':
        return this.metrics.componentRenders;
      case 'error':
        return this.metrics.errors;
      case 'custom_trace':
        return this.metrics.customTraces;
      default:
        return null;
    }
  }

  private getEventKey(event: PerformanceEvent): string {
    // Create a key based on event type and name for grouping similar events
    return `${event.type}_${event.name}`;
  }

  private sendToFirebase(event: PerformanceEvent): void {
    try {
      // Create a custom trace for Firebase Performance Monitoring
      const customTrace = trace(performance, `${event.type}_${event.name}`);
      customTrace.start();
      
      // Add custom attributes if available
      if (customTrace.setAttribute) {
        Object.entries(event.metadata).forEach(([key, value]) => {
          try {
            customTrace.setAttribute(key, String(value));
          } catch (error) {
            console.debug('Failed to set trace attribute:', key);
          }
        });
        
        // Add event metadata
        customTrace.setAttribute('event_id', event.id);
        customTrace.setAttribute('session_id', event.sessionId);
        if (event.userId) {
          customTrace.setAttribute('user_id', event.userId);
        }
        customTrace.setAttribute('url', event.url);
      }
      
      // Add custom metrics if available
      if (customTrace.addMetric) {
        customTrace.addMetric('value', event.value);
        customTrace.addMetric('unit', this.parseUnit(event.unit));
      }
      
      // Stop the trace immediately for instant events
      customTrace.stop();
    } catch (error) {
      console.debug('Failed to send event to Firebase:', error);
    }
  }

  private parseUnit(unit: string): number {
    // Convert unit to a numeric value for Firebase metrics
    const unitMap: Record<string, number> = {
      'ms': 1,
      's': 1000,
      'bytes': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'count': 1,
      'score': 1
    };
    return unitMap[unit] || 1;
  }

  public getMetrics(): PerformanceMetrics {
    return this.metrics;
  }

  public getMetricsSummary(): {
    totalEvents: number;
    pageLoads: number;
    apiRequests: number;
    componentRenders: number;
    errors: number;
    customTraces: number;
  } {
    const totalEvents = Array.from(this.metrics.pageLoads.values()).flat().length +
                       Array.from(this.metrics.apiRequests.values()).flat().length +
                       Array.from(this.metrics.componentRenders.values()).flat().length +
                       Array.from(this.metrics.errors.values()).flat().length +
                       Array.from(this.metrics.customTraces.values()).flat().length;

    return {
      totalEvents,
      pageLoads: Array.from(this.metrics.pageLoads.values()).flat().length,
      apiRequests: Array.from(this.metrics.apiRequests.values()).flat().length,
      componentRenders: Array.from(this.metrics.componentRenders.values()).flat().length,
      errors: Array.from(this.metrics.errors.values()).flat().length,
      customTraces: Array.from(this.metrics.customTraces.values()).flat().length
    };
  }

  public subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.observers.delete(callback);
    };
  }

  private notifyObservers(): void {
    this.observers.forEach(callback => {
      try {
        callback(this.metrics);
      } catch (error) {
        console.error('Error in performance observer callback:', error);
      }
    });
  }

  private setupDataCleanup(): void {
    // Clean up old data every hour
    setInterval(() => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      Object.values(this.metrics).forEach(categoryMap => {
        categoryMap.forEach((events, key) => {
          const filteredEvents = events.filter(event => event.timestamp > oneHourAgo);
          if (filteredEvents.length === 0) {
            categoryMap.delete(key);
          } else {
            categoryMap.set(key, filteredEvents);
          }
        });
      });
    }, 60 * 60 * 1000);
  }

  public destroy(): void {
    this.stopCollection();
    this.observers.clear();
    this.metrics.pageLoads.clear();
    this.metrics.apiRequests.clear();
    this.metrics.componentRenders.clear();
    this.metrics.errors.clear();
    this.metrics.customTraces.clear();
  }
}

// Create singleton instance
export const performanceCollector = new PerformanceCollector();

// Export the class for testing
export { PerformanceCollector };

// Export types
export type { PerformanceEvent, PerformanceMetrics };

