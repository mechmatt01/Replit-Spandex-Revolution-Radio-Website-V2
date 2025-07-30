# Deployment Guide for Spandex Salvation Radio

## Overview

This guide covers the production deployment fixes for the Spandex Salvation Radio platform, addressing the module import issues that were causing deployment failures.

## Fixed Issues

### 1. Vite Config Import Error

**Error**: `Cannot find module '/home/runner/workspace/vite.config' imported from /home/runner/workspace/dist/index.js`

**Fix**: The `deploy-production.js` script now:

- Conditionally loads vite.config only in development mode
- Provides inline fallback configuration for production
- Adds proper error handling for missing modules

### 2. Production Static File Serving

**Error**: Application crash looping due to incorrect static file paths

**Fix**: Updated `serveStatic` function to use correct path:

- Changed from `import.meta.dirname + "public"` to `process.cwd() + "client/dist"`
- Added logging to verify correct path resolution

### 3. Host and Port Binding

**Error**: Server not binding to correct host/port for Replit deployment

**Fix**: Updated server.listen to use environment variables:

- `PORT` or `REPL_LISTEN_PORT` (default: 5000)
- `HOST` or `REPL_LISTEN_IP` (default: 0.0.0.0)

### 4. Comprehensive Error Handling

**Error**: Various uncaught exceptions causing application crashes

**Fix**: Added production-grade error handling:

- Uncaught exception handler with module-not-found tolerance
- Unhandled promise rejection handler
- Graceful degradation for missing dependencies

## Deployment Scripts

### Primary Deployment Script

- `deploy-production.js` - Comprehensive production build with all fixes applied
- `build-production.js` - Alternative build script with targeted fixes
- `replit-deployment-fix.js` - Legacy deployment fixes

### Configuration Files

- `replit.toml` - Replit deployment configuration
- `start-production.sh` - Production startup script
- `.env.production` - Production environment variables

## Usage

### For Development

```bash
npm run dev
```

### For Production Build

```bash
node deploy-production.js
```

### For Production Start

```bash
NODE_ENV=production node dist/index.js
```

## Replit Deployment

The application is configured to automatically deploy on Replit using the `replit.toml` configuration:

1. **Build Phase**: Runs `node deploy-production.js` to create production build
2. **Start Phase**: Runs `node dist/index.js` to start the server
3. **Environment**: Automatically sets `NODE_ENV=production`

## Environment Variables Required

### Database

- `DATABASE_URL` - PostgreSQL connection string

### Optional

- `PORT` - Server port (default: 5000)
- `HOST` - Server host (default: 0.0.0.0)
- `NODE_ENV` - Environment mode (auto-set to production)

## Troubleshooting

### If deployment still fails:

1. Check that all required environment variables are set
2. Verify that the `client/dist` folder exists after build
3. Check logs for any remaining module import errors
4. Ensure all dependencies are properly installed

### Common Issues:

- **Module not found**: Check the build output for any remaining dynamic imports
- **Port binding**: Ensure PORT environment variable is set correctly
- **Static files**: Verify that frontend build completed successfully

## Testing Production Build Locally

```bash
# Build for production
node deploy-production.js

# Test production server
NODE_ENV=production node dist/index.js
```

The server should start without errors and serve the application on the specified port.

## Architecture Changes

The deployment fixes maintain the existing architecture while adding:

- Production-safe module loading
- Environment-aware configuration
- Comprehensive error handling
- Proper static file serving

All fixes are backward compatible and don't affect development mode functionality.
