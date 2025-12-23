# Firebase Hosting Deployment Guide

This guide will help you deploy the Spandex Salvation Radio website to Firebase Hosting on the `spandex-salvation-radio-site` project.

## Prerequisites

1. **Firebase CLI installed**
   ```bash
   npm install -g firebase-tools
   ```

2. **Authenticated Firebase account**
   ```bash
   firebase login
   ```

3. **Node.js v20.x or compatible version** (check your .node-version or package.json engines field)

## Environment Setup

### 1. Set Up Environment Variables

Copy the example environment file and fill in your Firebase project credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:
- Firebase API credentials from [Firebase Console](https://console.firebase.google.com/project/spandex-salvation-radio-site)
- Stripe API keys (if using subscriptions)
- reCAPTCHA site key
- Any other required API keys

### 2. Project Configuration

The Firebase project is already configured in:
- `.firebaserc` - Points to `spandex-salvation-radio-site`
- `firebase.json` - Hosting configuration with proper rewrites for SPA routing
- `client/vite.config.ts` - Client build configuration

## Building for Deployment

### Build the Client Application

```bash
cd client
npm install  # Install dependencies if not already done
npm run build
```

This creates the optimized production build in `client/dist/`.

The build includes:
- Minified JavaScript and CSS
- Code splitting for better performance
- Asset optimization with cache-busting

### Verify the Build

After building, verify the build output:

```bash
ls -la client/dist/
```

You should see:
- `index.html` - Main HTML file
- `assets/` - JavaScript and CSS bundles with hash suffixes
- Static assets (images, fonts, etc.)

## Deployment Steps

### 1. Verify Firebase Project

Confirm you're deploying to the correct Firebase project:

```bash
firebase projects:list
# Should show: spandex-salvation-radio-site
```

Set the project if needed:

```bash
firebase use spandex-salvation-radio-site
```

### 2. Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

This will:
- Upload the built application to Firebase Hosting
- Deploy the Firestore security rules
- Set up proper HTTP headers and redirects
- Configure cache control for static assets

### Full Stack Deployment (if using Cloud Functions)

```bash
firebase deploy
```

This deploys:
- Hosting
- Firestore rules
- Cloud Functions (if configured)

### 3. Verify Deployment

Check the deployment status:

```bash
firebase hosting:list
```

Visit your site at: `https://spandex-salvation-radio-site.web.app`

## Standalone Standalone Operation (Without Replit)

This application is now fully configured to run standalone without Replit:

### Local Development

```bash
# Install dependencies (only needed once)
npm install
cd client && npm install

# Start development server
npm run dev  # From root directory

# This starts Vite dev server on http://localhost:3000
```

### Local Production Testing

```bash
# Build
npm run build

# Serve locally
npm run preview  # From client directory
```

## Post-Deployment Checks

### 1. Verify Site Functionality

- [ ] Homepage loads at `https://spandex-salvation-radio-site.web.app`
- [ ] All navigation routes work (`/music`, `/profile`, `/login`, etc.)
- [ ] Static assets load properly (CSS, images, fonts)
- [ ] No console errors in browser developer tools

### 2. Check Firebase Integration

- [ ] Firebase authentication works (login/signup)
- [ ] Firestore data loads if applicable
- [ ] Firebase Storage works if images are used

### 3. Performance Checks

- [ ] Page load time is acceptable (under 3 seconds)
- [ ] Lighthouse score is good (90+)
- [ ] No broken links or 404 errors

## Troubleshooting

### Build Fails

If the build fails with errors:

```bash
# Clear cache and reinstall
rm -rf client/node_modules client/dist
cd client && npm install
npm run build
```

### Blank Page After Deployment

Check browser console for errors. Common issues:
- Missing environment variables in production
- Firestore security rules blocking access
- CORS issues with API calls

### Firebase Configuration Issues

Verify your Firebase config in `client/src/firebase.ts`:
- All required environment variables are set
- Project ID matches `spandex-salvation-radio-site`

### Enable Firebase Services

If you get Firebase billing errors:

1. Go to [Firebase Console](https://console.firebase.google.com/project/spandex-salvation-radio-site)
2. Enable the following services:
   - Firestore Database
   - Authentication
   - Cloud Storage (if needed)
   - Cloud Functions (if using backend)

## Configuration Files

### firebase.json
- Specifies the public directory as `client/dist`
- Configures SPA routing (all routes redirect to index.html)
- Sets up caching headers for optimal performance
- Includes security headers (X-Frame-Options, X-Content-Type-Options, etc.)

### .firebaserc
- Project alias mappings
- Currently targets `spandex-salvation-radio-site`

### client/vite.config.ts
- Vite build configuration
- Sets output directory to `dist/`
- Configures proxy for local API development

## Reverting a Deployment

To roll back to a previous version:

```bash
firebase hosting:channel:list  # View deployment history
firebase hosting:rollback      # Rollback to previous version
```

## Continuous Deployment (Optional)

Set up automatic deployments with GitHub Actions:

1. Generate Firebase deployment token:
   ```bash
   firebase login:ci
   ```

2. Add `FIREBASE_TOKEN` to GitHub Secrets

3. Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to Firebase Hosting
   on:
     push:
       branches: [main]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '20'
         - run: npm install && cd client && npm install && npm run build
         - uses: FirebaseExtended/action-hosting-deploy@v0
           with:
             repoToken: ${{ secrets.GITHUB_TOKEN }}
             firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
             channelId: live
             projectId: spandex-salvation-radio-site
   ```

## Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [Firebase Console](https://console.firebase.google.com/project/spandex-salvation-radio-site)
