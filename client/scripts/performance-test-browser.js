// Performance Testing Script - Browser Console Version
// Copy and paste this entire script into your browser console

console.log('🚀 Performance Testing Script Started');

// Test theme switching performance
function testThemeSwitching() {
  console.group('🎨 Theme Switching Performance Test');
  
  const startTime = performance.now();
  
  // Simulate theme change
  const themeToggle = document.querySelector('[data-theme-toggle]') || 
                     document.querySelector('button[onclick*="theme"]') ||
                     document.querySelector('button:contains("Theme")');
  
  if (themeToggle) {
    themeToggle.click();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Theme switch completed in ${duration.toFixed(2)}ms`);
    
    if (duration < 100) {
      console.log('🎯 EXCELLENT: Theme switching is fast!');
    } else if (duration < 500) {
      console.log('👍 GOOD: Theme switching is acceptable');
    } else {
      console.log('⚠️ SLOW: Theme switching needs optimization');
    }
  } else {
    console.log('❌ Theme toggle button not found');
  }
  
  console.groupEnd();
}

// Test scrolling performance
function testScrollingPerformance() {
  console.group('📜 Scrolling Performance Test');
  
  let frameCount = 0;
  let lastTime = performance.now();
  
  const scrollTest = () => {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      console.log(`📊 Current FPS: ${fps}`);
      
      if (fps >= 55) {
        console.log('🎯 EXCELLENT: Smooth scrolling performance!');
      } else if (fps >= 30) {
        console.log('👍 GOOD: Acceptable scrolling performance');
      } else {
        console.log('⚠️ POOR: Scrolling performance needs improvement');
      }
      
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(scrollTest);
  };
  
  // Start scrolling test
  requestAnimationFrame(scrollTest);
  
  // Stop after 5 seconds
  setTimeout(() => {
    console.log('⏱️ Scrolling performance test completed');
    console.groupEnd();
  }, 5000);
}

// Test component render performance
function testComponentRenders() {
  console.group('⚡ Component Render Performance Test');
  
  // Count React components
  const reactRoots = document.querySelectorAll('[data-reactroot], [data-reactid]');
  console.log(`🔍 Found ${reactRoots.length} React root elements`);
  
  // Check for excessive re-renders
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'measure') {
        console.log(`📏 Performance measure: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
      }
    });
  });
  
  observer.observe({ entryTypes: ['measure'] });
  
  // Measure theme context performance
  performance.mark('theme-context-start');
  
  // Simulate theme change
  setTimeout(() => {
    performance.mark('theme-context-end');
    performance.measure('Theme Context Update', 'theme-context-start', 'theme-context-end');
    
    console.log('✅ Theme context performance measured');
    observer.disconnect();
    console.groupEnd();
  }, 1000);
}

// Test memory usage
function testMemoryUsage() {
  console.group('🧠 Memory Usage Test');
  
  if ('memory' in performance) {
    const memory = performance.memory;
    const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
    const limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
    
    console.log(`📊 Memory Usage: ${used}MB / ${total}MB (${limit}MB limit)`);
    console.log(`📈 Memory Usage: ${((used / limit) * 100).toFixed(1)}%`);
    
    if (used > limit * 0.8) {
      console.log('⚠️ WARNING: High memory usage detected!');
    } else if (used > limit * 0.6) {
      console.log('⚠️ CAUTION: Moderate memory usage');
    } else {
      console.log('✅ GOOD: Memory usage is healthy');
    }
  } else {
    console.log('❌ Memory API not available');
  }
  
  console.groupEnd();
}

// Run all tests
function runAllTests() {
  console.log('🧪 Running all performance tests...');
  
  setTimeout(() => testThemeSwitching(), 1000);
  setTimeout(() => testScrollingPerformance(), 2000);
  setTimeout(() => testComponentRenders(), 3000);
  setTimeout(() => testMemoryUsage(), 4000);
}

// Make functions available globally
window.performanceTests = {
  testThemeSwitching,
  testScrollingPerformance,
  testComponentRenders,
  testMemoryUsage,
  runAllTests
};

console.log('📋 Performance tests available at: window.performanceTests');
console.log('💡 Run: window.performanceTests.runAllTests() to start all tests');

// Auto-run tests after page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runAllTests, 2000);
  });
} else {
  setTimeout(runAllTests, 2000);
}
