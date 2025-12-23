# Spandex Salvation Radio Website - Standalone Setup Guide

This document provides comprehensive instructions for running the Spandex Salvation Radio website standalone without Replit and deploying it to Firebase Hosting.

## Overview

The application consists of:
- **Frontend**: React + TypeScript with Vite (Compiled to `client/dist/`)
- **Firebase Backend**: Firestore, Authentication, Storage, Hosting
- **Optional Server**: Express.js for API endpoints (can be replaced with Firebase Cloud Functions)

## System Requirements

- **Node.js**: 18.0.0 or higher (20.x recommended)
- **npm**: 8.0.0 or higher
- **Git**: for version control
- **Firebase CLI**: for deployment

## Initial Setup

### Step 1: Clone or Extract the Repository

```bash
# If cloning from git
git clone <repository-url>
cd Replit-Spandex-Revolution-Radio-Website-V2

# Or extract the project folder
cd Replit-Spandex-Revolution-Radio-Website-V2
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### Step 3: Configure Firebase

#### Get Your Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `spandex-salvation-radio-site`
3. Go to **Project Settings** (gear icon)
4. Copy your Firebase config

#### Create `.env.local` File

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=spandex-salvation-radio-site.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=spandex-salvation-radio-site
VITE_FIREBASE_STORAGE_BUCKET=spandex-salvation-radio-site.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

For **backend Firebase Admin SDK** (optional, for server functions):

```env
FIREBASE_PROJECT_ID=spandex-salvation-radio-site
FIREBASE_CLIENT_EMAIL=your_service_account_email@spandex-salvation-radio-site.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=your_private_key_here
```

### Step 4: Verify Firebase Project Configuration

Check that `.firebaserc` targets the correct project:

```bash
cat .firebaserc
```

Should show:
```json
{
  "projects": {
    "default": "spandex-salvation-radio-site"
  }
}
```

If needed, set the project:

```bash
firebase use spandex-salvation-radio-site
```

## Development

### Start Development Server

```bash
# From root directory
npm run dev
```

This starts:
- **Vite dev server** on `http://localhost:3000`
- **Hot module replacement (HMR)** for instant code reload
- **Proxy to backend API** at `/api` endpoints

### Development Features

- **Fast refresh**: Code changes reflect instantly
- **Source maps**: Debug TypeScript directly in browser
- **CSS hot reload**: CSS changes apply without refresh
- **Environment variables**: Loaded from `.env.local`

### Common Development Commands

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Build server for Cloud Run deployment
npm run build:cloud-run

# Start production server
npm start
```

## Production Build

### Building the Application

```bash
npm run build
```

This creates:
- Optimized, minified production build
- Code splitting for better performance
- Asset hashing for cache busting
- Output directory: `client/dist/`

### Verify Build Output

```bash
ls -la client/dist/

# Expected structure:
# client/dist/
#   ├── index.html          (Main entry point)
#   ├── assets/
#   │   ├── index-xxx.js    (JS bundles with hash)
#   │   ├── index-xxx.css   (CSS bundles with hash)
#   │   └── vendor-xxx.js   (Vendor libraries)
#   └── [static assets]
```

## Firebase Hosting Deployment

### Prerequisites for Deployment

1. **Firebase CLI installed and authenticated**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Production build created**
   ```bash
   npm run build
   ```

3. **Firebase project configured**
   ```bash
   firebase use spandex-salvation-radio-site
   ```

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

### Full Deployment (with Firestore rules and functions)

```bash
firebase deploy
```

### View Deployment Status

```bash
firebase hosting:list
```

### Access Your Live Site

After successful deployment:
- **URL**: `https://spandex-salvation-radio-site.web.app`
- **Alternate**: `https://spandex-salvation-radio-site.firebaseapp.com`

## Configuration Files Reference

### `firebase.json`
- Specifies public directory: `client/dist`
- Configures SPA routing (all routes → index.html)
- Sets cache control headers
- Includes security headers
- Handles redirects for legacy URLs

### `.firebaserc`
- Project mappings and targets
- Currently configured for `spandex-salvation-radio-site`

### `client/vite.config.ts`
- Vite build configuration
- Output: `dist/`
- Proxy configuration for local API development
- Asset optimization settings

### `tsconfig.json` & `client/tsconfig.json`
- TypeScript compiler options
- Path aliases (`@/*`, `@shared/*`)
- ES2020+ target with React JSX support

## Firebase Services Configuration

### Firestore Database
- **Location**: `spandex-salvation-radio-site`
- **Mode**: Can be set to production or test mode
- **Accessed by**: `client/src/firebase.ts`

### Authentication
- **Methods**: Email/Password, Google OAuth
- **Configured in**: `client/src/firebase.ts`

### Cloud Storage
- **Bucket**: `spandex-salvation-radio-site.firebasestorage.app`
- **Used for**: User uploads, images, audio files

### Hosting
- **Domain**: `spandex-salvation-radio-site.web.app`
- **SSL**: Automatically enabled
- **CDN**: Global content delivery

## Environment Variables

### Required for Production

```env
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

### Optional

```env
VITE_FIREBASE_MEASUREMENT_ID      # Google Analytics
VITE_USE_FIREBASE_EMULATORS=false # Local emulator
VITE_STRIPE_PUBLISHABLE_KEY       # Stripe payments
VITE_RECAPTCHA_SITE_KEY          # reCAPTCHA
STRIPE_SECRET_KEY                 # Backend stripe
```

## Troubleshooting

### Build Issues

**"Cannot find module" errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules client/node_modules
npm install && cd client && npm install
```

**TypeScript errors**
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm install
```

### Firebase Issues

**"Permission denied" when accessing Firestore**
- Check Firestore security rules in Firebase Console
- Verify authentication is configured correctly
- Ensure user is logged in for protected data

**"Firebase config missing" warning**
- Verify `.env.local` has all required Firebase variables
- Check environment variables are being loaded: `console.log(import.meta.env.VITE_FIREBASE_PROJECT_ID)`

### Deployment Issues

**Build succeeds but site shows blank page**
1. Check browser console for errors
2. Verify `client/dist/index.html` exists
3. Check Firebase Hosting logs: `firebase hosting:channel:log live`

**404 errors on routes**
- Verify `firebase.json` has the SPA rewrite rule
- Check that `index.html` exists in `client/dist/`

**Static assets not loading**
- Check asset paths in browser DevTools
- Verify cache headers in `firebase.json`

## Git and Version Control

### Ignoring Files

`.gitignore` is configured to exclude:
- `node_modules/`
- `client/dist/`
- `.env.local` (sensitive credentials)
- Firebase caches

### Committing Changes

```bash
git add .
git commit -m "Update description"
git push origin main
```

## Performance Optimization

### Current Optimizations

- **Code splitting**: Vendor libraries separated
- **Minification**: Production build minified
- **Asset hashing**: Unique hashes for cache busting
- **Lazy loading**: Routes loaded on demand
- **Image optimization**: Handled by Vite

### Additional Recommendations

1. **Enable Gzip compression** in Firebase Hosting (automatic)
2. **Use service workers** for offline support (configured in `client/src/main.tsx`)
3. **Monitor Core Web Vitals** via Google Analytics
4. **Use Chrome DevTools** for performance analysis

## Monitoring and Analytics

### Firebase Console

Monitor:
- **Hosting**: Deployment history, traffic, performance
- **Authentication**: User signups, active sessions
- **Firestore**: Document reads/writes, storage usage
- **Real-time Database**: (if used) Live data

### Google Analytics

Configured if `VITE_FIREBASE_MEASUREMENT_ID` is set.

## Support and Documentation

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Firebase Console](https://console.firebase.google.com/project/spandex-salvation-radio-site)

## Next Steps

1. ✅ Complete `.env.local` configuration
2. ✅ Test locally with `npm run dev`
3. ✅ Build production version with `npm run build`
4. ✅ Deploy to Firebase with `firebase deploy --only hosting`
5. ✅ Verify live site functionality
6. ✅ Set up monitoring and analytics
