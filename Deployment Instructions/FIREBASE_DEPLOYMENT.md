# Firebase Deployment Guide for Spandex Salvation Radio

## Overview
This project is configured to deploy to Firebase Hosting at the custom domain **https://www.spandex-salvation-radio.com/**

## Deployment Configuration

### Firebase Project
- **Project ID**: `spandex-salvation-radio-site`
- **Hosting Site**: `spandex-salvation-radio-site`
- **Custom Domain**: `https://www.spandex-salvation-radio.com/`

### Build Configuration
- **Source Directory**: `client/`
- **Build Output**: `client/dist/`
- **Build Command**: `npm run build` (runs in client directory)

## Deployment Steps

### 1. Automated Deployment (Recommended)
```bash
./deploy-firebase.sh
```

### 2. Manual Deployment
```bash
# Build the client application
cd client && npm run build && cd ..

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### 3. First Time Setup
If this is your first deployment:

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize project (already done):
```bash
firebase init hosting
```

## Configuration Files

### firebase.json
- Configured for single-page application routing
- Optimized caching headers for static assets
- Custom domain configuration
- Clean URLs enabled

### .firebaserc
- Project association with `spandex-salvation-radio-site`

## Domain Configuration

### Custom Domain Setup
1. In Firebase Console, go to Hosting
2. Add custom domain: `www.spandex-salvation-radio.com`
3. Follow DNS configuration instructions
4. SSL certificate will be automatically provisioned

### DNS Records Required
```
Type: CNAME
Name: www
Value: spandex-salvation-radio-site.web.app
```

## Performance Optimizations

### Caching Strategy
- Static assets (JS, CSS, images): 1 year cache
- HTML files: No cache (for dynamic updates)
- Fonts: 1 year cache

### Bundle Optimization
- Current bundle size: ~1MB (gzipped: ~253KB)
- Consider code splitting if bundle grows larger
- Dynamic imports for route-based code splitting

## Monitoring and Analytics

### Firebase Hosting Features
- Automatic SSL/TLS certificates
- Global CDN distribution
- Real-time deployment status
- Traffic analytics
- Custom headers support

### Production Monitoring
- Monitor Core Web Vitals
- Track deployment status
- Monitor CDN performance
- Set up alerts for downtime

## Environment Variables

### Production Environment
All environment variables are built into the client bundle during build time.
Sensitive variables should be prefixed with `VITE_` and configured in the build environment.

## Rollback Strategy

### Quick Rollback
```bash
firebase hosting:rollback
```

### Specific Version Rollback
```bash
firebase hosting:rollback --site spandex-salvation-radio-site
```

## Troubleshooting

### Common Issues
1. **Build failures**: Check TypeScript compilation errors
2. **404 errors**: Verify SPA routing configuration in firebase.json
3. **Asset loading**: Check relative path configurations
4. **Custom domain**: Verify DNS configuration and SSL setup

### Build Verification
Before deployment, verify:
- `npm run build` completes successfully
- All routes work in production build
- Static assets load correctly
- No console errors in production mode

## Security Considerations

### Content Security Policy
- Configured for Google Maps API
- Font loading from Google Fonts
- External image domains allowed

### HTTPS Enforcement
- Automatic HTTPS redirect
- HSTS headers configured
- Secure cookie settings

## Deployment History
- **July 30, 2025**: Initial Firebase Hosting configuration
- Enhanced background overlay for better text visibility
- Production build optimization (18.95s build time)
- Firebase CLI deployment script created

## Next Steps
1. Configure custom domain DNS
2. Set up continuous deployment (optional)
3. Configure Firebase Analytics
4. Set up performance monitoring
5. Configure error tracking