
#!/usr/bin/env node

// Production startup wrapper with error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('Module not found - attempting to continue with available modules');
    return;
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// Set production environment
process.env.NODE_ENV = 'production';

// Import and start the main application
import('./dist/index.js').catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
