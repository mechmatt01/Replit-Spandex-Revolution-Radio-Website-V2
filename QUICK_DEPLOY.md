# Quick Start: Deploy to Firebase Hosting

Follow these steps to deploy the Spandex Salvation Radio website to Firebase Hosting.

## Quick Deployment (5 minutes)

### 1. Install Dependencies (First Time Only)

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Configure Firebase Credentials

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Firebase credentials
# Get credentials from: https://console.firebase.google.com/project/spandex-salvation-radio-site/settings/general
```

### 3. Build the Project

```bash
npm run build
```

**Expected output**: `client/dist/` directory created with `index.html` and assets

### 4. Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

**Success**: Site available at `https://spandex-salvation-radio-site.web.app`

---

## Detailed Steps

### Before You Start

- ✅ Node.js 18+ installed (`node --version`)
- ✅ Firebase CLI installed (`npm install -g firebase-tools`)
- ✅ Firebase CLI authenticated (`firebase login`)
- ✅ Firebase project: `spandex-salvation-radio-site`

### Step 1: Project Setup

```bash
# Navigate to project directory
cd Replit-Spandex-Revolution-Radio-Website-V2

# Install all dependencies
npm install
cd client && npm install && cd ..
```

### Step 2: Configure Environment

Create `.env.local` file with Firebase credentials:

```bash
cp .env.example .env.local
```

Get your Firebase credentials from:
1. [Firebase Console](https://console.firebase.google.com)
2. Select project: **spandex-salvation-radio-site**
3. Click gear icon → **Project Settings**
4. Scroll to **Your apps** → Select Web App → Copy config

Update `.env.local`:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=spandex-salvation-radio-site.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=spandex-salvation-radio-site
VITE_FIREBASE_STORAGE_BUCKET=spandex-salvation-radio-site.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789...
VITE_FIREBASE_APP_ID=1:123456789...
```

### Step 3: Verify Firebase Project

```bash
# Check Firebase project
firebase projects:list

# Set project if needed
firebase use spandex-salvation-radio-site
```

### Step 4: Build Production Version

```bash
npm run build
```

Verify build output:

```bash
ls -la client/dist/
# Should show: index.html, assets/, and other static files
```

### Step 5: Test Locally (Optional)

```bash
# Preview the production build locally
cd client
npm run preview
# Open http://localhost:4173
```

### Step 6: Deploy to Firebase

```bash
# Deploy only hosting (fastest)
firebase deploy --only hosting

# Or deploy everything (hosting + rules + functions)
firebase deploy
```

### Step 7: Verify Live Site

Open in browser:
- **Primary**: https://spandex-salvation-radio-site.web.app
- **Alternate**: https://spandex-salvation-radio-site.firebaseapp.com

Test that:
- ✅ Page loads without errors
- ✅ All routes work (`/`, `/music`, `/profile`, etc.)
- ✅ Static assets load (CSS, images)
- ✅ No console errors (F12 → Console tab)

---

## Troubleshooting

### "Cannot find firebase" error

```bash
firebase login  # Authenticate with Firebase
```

### Build fails with "Cannot find module"

```bash
# Clear and reinstall
rm -rf node_modules client/node_modules
npm install && cd client && npm install && cd ..

# Rebuild
npm run build
```

### Blank page after deployment

1. **Check browser console** (F12):
   - Look for red error messages
   - Search for "Firebase" errors

2. **Verify Firebase config**:
   - Check `.env.local` has all required variables
   - Ensure project ID matches: `spandex-salvation-radio-site`

3. **Check Firebase services are enabled**:
   - [Firebase Console](https://console.firebase.google.com/project/spandex-salvation-radio-site)
   - Navigate to each service (Firestore, Auth, Storage)
   - Click "Enable" if disabled

### "Permission denied" errors

**For Firestore access**:
1. Go to [Firebase Console](https://console.firebase.google.com/project/spandex-salvation-radio-site/firestore)
2. Select **Firestore Database**
3. Update security rules if needed

### Deployment takes too long or fails

```bash
# Check Firebase hosting logs
firebase hosting:channel:log live

# Retry deployment
firebase deploy --only hosting
```

---

## Development Workflow

### Local Development (with hot reload)

```bash
npm run dev
```

Opens http://localhost:3000 with:
- ✅ Instant code reload
- ✅ Preserved app state
- ✅ Error overlay

### Make Changes → Deploy Cycle

```bash
# 1. Make code changes
# 2. Test with: npm run dev
# 3. Commit changes: git add . && git commit -m "message"
# 4. Build: npm run build
# 5. Deploy: firebase deploy --only hosting
```

---

## Project Structure

```
Replit-Spandex-Revolution-Radio-Website-V2/
├── client/                  # React frontend
│   ├── src/                # React components, pages, hooks
│   ├── public/             # Static assets
│   ├── dist/               # Production build (created by npm run build)
│   └── vite.config.ts      # Vite build config
├── server/                 # Express backend (optional)
├── functions/              # Firebase Cloud Functions (optional)
├── firebase.json           # Firebase Hosting config
├── .firebaserc            # Firebase project settings
├── .env.example           # Environment template
└── package.json           # Root dependencies
```

---

## Next Steps

### 1. Monitor Your Site

After deployment, monitor at:
- [Firebase Hosting Dashboard](https://console.firebase.google.com/project/spandex-salvation-radio-site/hosting/dashboard)
  - Traffic statistics
  - Deployment history
  - Performance metrics

### 2. Set Up Custom Domain (Optional)

1. Go to Firebase Hosting → Connect Domain
2. Follow domain provider instructions
3. Typically takes 24 hours to propagate

### 3. Enable HTTPS-Only (Recommended)

Already enabled by default on Firebase Hosting ✓

### 4. Set Up Redirects or Rewrites

Edit `firebase.json` `redirects` or `rewrites` sections if needed.

### 5. Configure Performance Monitoring

If `VITE_FIREBASE_MEASUREMENT_ID` is set, Google Analytics is automatically enabled.

---

## Common Tasks

### Deploy Only Frontend

```bash
firebase deploy --only hosting
```

### Deploy Everything

```bash
firebase deploy
```

### View Deployment History

```bash
firebase hosting:channel:list
```

### Rollback to Previous Version

```bash
firebase hosting:rollback
```

### Check Logs

```bash
firebase hosting:channel:log live
```

### Delete a Deployment

```bash
firebase hosting:channel:delete [channel-name]
```

---

## Getting Help

- **Firebase Docs**: https://firebase.google.com/docs/hosting
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **Firebase Console**: https://console.firebase.google.com/project/spandex-salvation-radio-site

---

## Success Checklist

- [ ] Node.js 18+ installed
- [ ] Firebase CLI installed and authenticated
- [ ] `.env.local` created and configured
- [ ] `npm install` completed (both root and client)
- [ ] `npm run build` succeeds
- [ ] `client/dist/` directory created
- [ ] `firebase deploy --only hosting` succeeds
- [ ] Site loads at https://spandex-salvation-radio-site.web.app
- [ ] All pages and routes work
- [ ] No console errors in browser
- [ ] Images and assets load correctly

---

You're all set! Your website is now live on Firebase Hosting. 🎉
