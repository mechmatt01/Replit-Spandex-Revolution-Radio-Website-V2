# Firebase Performance Monitoring Implementation

This document describes the Firebase Performance Monitoring implementation for the Spandex Salvation Radio Website V2 project, based on the [Firebase Performance Monitoring for web documentation](https://firebase.google.com/docs/perf-mon/get-started-web#web).

## Overview

Firebase Performance Monitoring has been integrated into the project to automatically collect performance data and provide custom monitoring capabilities for specific operations. The implementation uses the **modular API** approach as recommended by Firebase.

## What's Automatically Monitored

Firebase Performance Monitoring automatically collects the following metrics:

- **Page Load Performance**: Core Web Vitals (LCP, FID, CLS)
- **Network Requests**: HTTP/S requests with timing data
- **App Startup Time**: Time from app initialization to first render
- **User Interactions**: First input delay and other interaction metrics

## Custom Performance Monitoring

### 1. API Request Performance

All API requests are automatically monitored through the enhanced `queryClient`:

```typescript
// Automatically measures performance of all API calls
const data = await apiRequest('GET', '/api/radio-stations');
```

**Metrics collected:**
- Request method
- URL length
- Whether request has data
- Response time
- Success/error status

### 2. Component Render Performance

Measure how long components take to render:

```typescript
import { measureComponentRender } from '../lib/performance';

const renderContent = () => {
  return measureComponentRender('component_name', () => {
    // Your render logic here
    return <div>Content</div>;
  });
};
```

### 3. Async Operation Performance

Measure the duration of async operations:

```typescript
import { measureAsyncOperation } from '../lib/performance';

const result = await measureAsyncOperation('operation_name', async () => {
  // Your async operation here
  return await someAsyncFunction();
}, { 
  custom_metric: 1,
  operation_type: 'database_query'
});
```

### 4. Synchronous Operation Performance

Measure the duration of sync operations:

```typescript
import { measureSyncOperation } from '../lib/performance';

const result = measureSyncOperation('operation_name', () => {
  // Your sync operation here
  return someSyncFunction();
}, { 
  operation_complexity: 5
});
```

### 5. Page Load Performance

Automatically measure page load times:

```typescript
import { measurePageLoad } from '../lib/performance';

useEffect(() => {
  measurePageLoad('page_name');
}, []);
```

### 6. Image Loading Performance

Measure image loading performance:

```typescript
import { measureImageLoad } from '../lib/performance';

await measureImageLoad('https://example.com/image.jpg');
```

## Performance Monitoring Functions

### Core Functions

- `createCustomTrace(traceName: string)`: Create a custom performance trace
- `measureAsyncOperation(traceName, operation, metrics)`: Measure async operations
- `measureSyncOperation(traceName, operation, metrics)`: Measure sync operations
- `measurePageLoad(pageName)`: Measure page load performance
- `measureApiRequest(endpoint, requestFn)`: Measure API request performance
- `measureImageLoad(imageUrl)`: Measure image loading performance
- `measureComponentRender(componentName, renderFn)`: Measure component render performance

### Utility Functions

- `enablePerformanceMonitoring(enabled)`: Enable/disable performance monitoring
- `initializePerformanceMonitoring()`: Initialize with default settings

## Configuration

### Environment Variables

Performance monitoring is automatically enabled in production and can be controlled via:

```typescript
// Automatically enabled in production, disabled in development
const isProduction = import.meta.env.PROD;
enablePerformanceMonitoring(isProduction);
```

### Firebase Configuration

The performance monitoring is initialized in `client/src/firebase.ts`:

```typescript
import { getPerformance } from 'firebase/performance';

// Initialize Performance Monitoring
const performance = getPerformance(app);
```

## Usage Examples

### Radio Player Performance

```typescript
// Measure station change performance
const handleStationChange = async (newStation: RadioStation) => {
  try {
    await measureAsyncOperation('radio_station_change', async () => {
      setCurrentStation(newStation);
      setHasError(false);
      
      if (isPlaying) {
        await handlePlay();
      }
    }, { 
      station_id: 1,
      station_name: newStation.name.length
    });
  } catch (error) {
    console.error('Error changing station:', error);
    setHasError(true);
  }
};
```

### Live Chat Performance

```typescript
// Measure message sending performance
const sendMessage = async (message: string) => {
  try {
    await measureAsyncOperation('live_chat_send_message', async () => {
      // Message sending logic
      setMessages(prev => [...prev, message]);
    }, { 
      message_length: message.length,
      user_premium: hasPremiumSubscription ? 1 : 0
    });
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};
```

### API Request Performance

```typescript
// Automatically measured by queryClient
const { data } = useQuery({
  queryKey: ['radio-stations'],
  queryFn: () => fetch('/api/radio-stations').then(res => res.json())
});
```

## Viewing Performance Data

### Firebase Console

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Performance** in the left sidebar
4. View automatically collected metrics and custom traces

### Custom Metrics

Custom metrics are displayed with the following naming convention:
- `api_request_<method>`: API request performance
- `query_function_<endpoint>`: Query function performance
- `radio_player_<action>`: Radio player actions
- `live_chat_<action>`: Live chat actions
- `page_load_<page_name>`: Page load performance
- `component_render_<component_name>`: Component render performance

## Best Practices

### 1. Use Descriptive Trace Names

```typescript
// Good
measureAsyncOperation('user_profile_update', async () => { ... });

// Avoid
measureAsyncOperation('op', async () => { ... });
```

### 2. Add Relevant Custom Metrics

```typescript
await measureAsyncOperation('database_query', async () => { ... }, {
  table_name: 'users',
  query_type: 'select',
  result_count: results.length
});
```

### 3. Handle Errors Gracefully

```typescript
try {
  await measureAsyncOperation('operation_name', async () => { ... });
} catch (error) {
  // Error is automatically recorded in the trace
  console.error('Operation failed:', error);
}
```

### 4. Avoid Over-Monitoring

Don't measure every single operation. Focus on:
- Critical user journeys
- Performance-sensitive operations
- Operations that could fail
- Operations that vary significantly in duration

## Troubleshooting

### Performance Data Not Appearing

1. **Check Firebase Configuration**: Ensure your app is properly configured with Firebase
2. **Verify App ID**: Make sure your Firebase config includes the correct `appId`
3. **Check Network**: Look for requests to `firebaselogging.googleapis.com` in browser dev tools
4. **Wait for Processing**: Performance data is batched and sent every 10 seconds

### Custom Traces Not Working

1. **Check Import**: Ensure `measureAsyncOperation` is properly imported
2. **Verify Performance Instance**: Check that Firebase Performance is initialized
3. **Check Console**: Look for any error messages in the browser console

### Development vs Production

- **Development**: Performance monitoring can be disabled to reduce noise
- **Production**: Performance monitoring is automatically enabled
- **Testing**: Use the Firebase console to verify data collection

## Performance Impact

The Firebase Performance Monitoring SDK has minimal performance impact:
- **Bundle Size**: ~15KB gzipped
- **Runtime Overhead**: <1ms per trace
- **Network**: Batched requests every 10 seconds
- **Memory**: Minimal memory footprint

## Next Steps

1. **Monitor Key Metrics**: Watch the Firebase console for performance insights
2. **Set Up Alerts**: Configure performance alerts for critical metrics
3. **Optimize Based on Data**: Use performance data to identify optimization opportunities
4. **Expand Monitoring**: Add custom traces for other critical operations

## Resources

- [Firebase Performance Monitoring Documentation](https://firebase.google.com/docs/perf-mon)
- [Web Performance Best Practices](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Firebase Console](https://console.firebase.google.com/)

## Support

For issues with Firebase Performance Monitoring:
1. Check the [Firebase documentation](https://firebase.google.com/docs)
2. Visit [Firebase Support](https://firebase.google.com/support)
3. Check the [Firebase Status Page](https://status.firebase.google.com/)
