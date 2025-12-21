import { performance } from '../firebase';
import { trace } from 'firebase/performance';

// Create a custom trace for measuring specific operations
export const createCustomTrace = (traceName: string): any => {
  return trace(performance, traceName);
};

// Measure the duration of an async operation
export const measureAsyncOperation = async <T>(
  traceName: string, 
  operation: () => Promise<T>,
  additionalMetrics?: Record<string, number>
): Promise<T> => {
  const customTrace = createCustomTrace(traceName);
  
  try {
    customTrace.start();
    
    // Add custom attributes if provided
    if (additionalMetrics) {
      Object.entries(additionalMetrics).forEach(([key, value]) => {
        try {
          // Use the setAttribute method if available
          if (customTrace.setAttribute) {
            customTrace.setAttribute(key, value.toString());
          }
        } catch (error) {
          // Silently fail if setAttribute is not available
          console.debug('setAttribute not available for trace:', key);
        }
      });
    }
    
    const result = await operation();
    
    // Add success metric if available
    try {
      if (customTrace.addMetric) {
        customTrace.addMetric('success', 1);
      }
    } catch (error) {
      console.debug('addMetric not available for trace');
    }
    
    return result;
  } catch (error) {
    // Add error metric if available
    try {
      if (customTrace.addMetric) {
        customTrace.addMetric('error', 1);
      }
      if (customTrace.setAttribute) {
        customTrace.setAttribute('error_message', error instanceof Error ? error.message : 'Unknown error');
      }
    } catch (metricError) {
      console.debug('Metrics not available for trace');
    }
    throw error;
  } finally {
    customTrace.stop();
  }
};

// Measure the duration of a synchronous operation
export const measureSyncOperation = <T>(
  traceName: string, 
  operation: () => T,
  additionalMetrics?: Record<string, number>
): T => {
  const customTrace = createCustomTrace(traceName);
  
  try {
    customTrace.start();
    
    // Add custom attributes if provided
    if (additionalMetrics) {
      Object.entries(additionalMetrics).forEach(([key, value]) => {
        try {
          if (customTrace.setAttribute) {
            customTrace.setAttribute(key, value.toString());
          }
        } catch (error) {
          console.debug('setAttribute not available for trace:', key);
        }
      });
    }
    
    const result = operation();
    
    // Add success metric if available
    try {
      if (customTrace.addMetric) {
        customTrace.addMetric('success', 1);
      }
    } catch (error) {
      console.debug('addMetric not available for trace');
    }
    
    return result;
  } catch (error) {
    // Add error metric if available
    try {
      if (customTrace.addMetric) {
        customTrace.addMetric('error', 1);
      }
      if (customTrace.setAttribute) {
        customTrace.setAttribute('error_message', error instanceof Error ? error.message : 'Unknown error');
      }
    } catch (metricError) {
      console.debug('Metrics not available for trace');
    }
    throw error;
  } finally {
    customTrace.stop();
  }
};

// Measure page load performance
export const measurePageLoad = (pageName: string) => {
  const customTrace = createCustomTrace(`page_load_${pageName}`);
  customTrace.start();
  
  // Stop the trace when the page is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      customTrace.stop();
    });
  } else {
    customTrace.stop();
  }
};

// Measure API request performance
export const measureApiRequest = async <T>(
  endpoint: string,
  requestFn: () => Promise<T>
): Promise<T> => {
  return measureAsyncOperation(`api_request_${endpoint}`, requestFn, {
    endpoint: 1
  });
};

// Measure image loading performance
export const measureImageLoad = (imageUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const customTrace = createCustomTrace(`image_load_${imageUrl.split('/').pop()?.split('?')[0] || 'unknown'}`);
    customTrace.start();
    
    const img = new Image();
    img.onload = () => {
      try {
        if (customTrace.addMetric) {
          customTrace.addMetric('image_size_bytes', img.naturalWidth * img.naturalHeight * 4); // Approximate size
        }
      } catch (error) {
        console.debug('addMetric not available for trace');
      }
      customTrace.stop();
      resolve();
    };
    img.onerror = () => {
      try {
        if (customTrace.addMetric) {
          customTrace.addMetric('error', 1);
        }
      } catch (error) {
        console.debug('addMetric not available for trace');
      }
      customTrace.stop();
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };
    img.src = imageUrl;
  });
};

// Measure component render performance
export const measureComponentRender = (componentName: string, renderFn: () => void) => {
  return measureSyncOperation(`component_render_${componentName}`, renderFn, {
    component: 1
  });
};

// Initialize performance monitoring with default settings
export const initializePerformanceMonitoring = () => {
  // Performance monitoring is automatically enabled when Firebase is initialized
  // Measure initial page load
  measurePageLoad('app_initialization');
  
  console.log('Firebase Performance Monitoring initialized');
};

// Export the main performance instance for direct use
export { performance };
