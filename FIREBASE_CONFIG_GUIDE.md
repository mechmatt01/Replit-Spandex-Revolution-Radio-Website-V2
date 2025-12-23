# Firebase Configuration Guide

Complete guide to configuring and using Firebase services for the Spandex Salvation Radio application.

## Project Information

- **Project ID:** `spandex-salvation-radio-site`
- **Project Console:** https://console.firebase.google.com/project/spandex-salvation-radio-site
- **Hosting URL:** https://spandex-salvation-radio-site.web.app
- **Region:** us-central1 (default)

## Getting Started with Firebase

### 1. Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your Google account
3. Click "Spandex Salvation Radio" project or search for `spandex-salvation-radio-site`

### 2. Get Your Firebase Credentials

1. Click ⚙️ (Settings icon) → **Project Settings**
2. Scroll down to "Your apps" section
3. Click the Web app (looks like `</>``)
4. Copy the Firebase config object

Example:
```javascript
{
  "apiKey": "AIza...",
  "authDomain": "spandex-salvation-radio-site.firebaseapp.com",
  "projectId": "spandex-salvation-radio-site",
  "storageBucket": "spandex-salvation-radio-site.firebasestorage.app",
  "messagingSenderId": "123456789...",
  "appId": "1:123456789...:web:abcdef...",
  "measurementId": "G-XXXXXXXX"
}
```

### 3. Configure Environment Variables

Create `.env.local`:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=spandex-salvation-radio-site.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=spandex-salvation-radio-site
VITE_FIREBASE_STORAGE_BUCKET=spandex-salvation-radio-site.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789...
VITE_FIREBASE_APP_ID=1:123456789...
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXX
```

## Firebase Services

### 🔐 Authentication

#### Configuration

Firebase Authentication is configured in `client/src/firebase.ts`.

Supported methods:
- ✅ Email/Password
- ✅ Google OAuth
- ❌ Phone (optional)
- ❌ Facebook (optional)
- ❌ Twitter (optional)

#### Enable Authentication Methods

1. Go to [Firebase Console](https://console.firebase.google.com/project/spandex-salvation-radio-site) → **Authentication**
2. Click **Get started**
3. Enable **Email/Password**:
   - Click "Email/Password"
   - Toggle **Enabled**
   - Click **Save**

4. Enable **Google** (optional):
   - Click "Google"
   - Toggle **Enabled**
   - Choose support email
   - Add authorized domains
   - Click **Save**

#### Usage in Code

```typescript
// Email/Password signup
import { signUpWithEmail } from './firebase';
const result = await signUpWithEmail(email, password, firstName, lastName);

// Email/Password login
import { signInWithEmail } from './firebase';
const result = await signInWithEmail(email, password);

// Google login
import { signInWithGoogle } from './firebase';
const result = await signInWithGoogle();

// Get current user
import { auth } from './firebase';
const user = auth.currentUser;

// Logout
await signOut(auth);
```

#### Security Rules

Located in `firestore.rules`. Example:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Allow public reads
    match /public/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 🗄️ Firestore Database

#### Setup

1. Go to [Firebase Console](https://console.firebase.google.com/project/spandex-salvation-radio-site) → **Firestore Database**
2. Click **Create database**
3. Choose location: **us-central1** (or preferred region)
4. Start in **Production mode** (production rules applied)
5. Click **Enable**

#### Data Structure

Example structure:

```
users/
  {uid}/
    profile:
      displayName
      photoURL
      email
      createdAt
    
stations/
  {stationId}/
    name
    description
    streamUrl
    imageUrl

subscriptions/
  {userId}/
    status: "active" | "canceled"
    plan: "basic" | "premium"
    currentPeriodEnd
```

#### Usage in Code

```typescript
import { db } from './firebase';
import { collection, doc, getDoc, setDoc, query, where } from 'firebase/firestore';

// Read document
const userDoc = await getDoc(doc(db, 'users', userId));
const userData = userDoc.data();

// Write document
await setDoc(doc(db, 'users', userId), {
  displayName: 'John Doe',
  email: 'john@example.com'
});

// Query data
const q = query(collection(db, 'users'), where('status', '==', 'active'));
const snapshot = await getDocs(q);

// Update document
await updateDoc(doc(db, 'users', userId), {
  lastLogin: new Date()
});

// Delete document
await deleteDoc(doc(db, 'users', userId));
```

#### Security Rules

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Stations readable by all, writable by admins
    match /stations/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid in get(/databases/$(database)/documents/admins/users).data.uids;
    }
    
    // Subscriptions readable by owner, writable by functions
    match /subscriptions/{uid}/plans/{planId} {
      allow read: if request.auth.uid == uid;
      allow write: if false;
    }
  }
}
```

### 📦 Cloud Storage

#### Setup

1. Go to [Firebase Console](https://console.firebase.google.com/project/spandex-salvation-radio-site) → **Storage**
2. Click **Get started**
3. Choose **Start in Production mode**
4. Choose location: **us-central1**
5. Click **Done**

#### Usage in Code

```typescript
import { storage } from './firebase';
import { ref, uploadBytes, getBytes } from 'firebase/storage';

// Upload file
const fileRef = ref(storage, `uploads/${userId}/avatar.jpg`);
await uploadBytes(fileRef, file);

// Download file
const bytes = await getBytes(fileRef);

// Delete file
await deleteObject(fileRef);
```

#### Security Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can read/write files in their own folder
    match /uploads/{uid}/{allPaths=**} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Public folder readable by all
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 🌐 Hosting

#### Configuration

Managed by `firebase.json`:

```json
{
  "hosting": {
    "public": "client/dist",
    "target": "spandex-salvation-radio-site",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### Deploy

```bash
# Deploy only hosting
firebase deploy --only hosting

# Deploy specific target
firebase deploy --only hosting:spandex-salvation-radio-site
```

#### Monitor

1. Go to [Firebase Hosting Console](https://console.firebase.google.com/project/spandex-salvation-radio-site/hosting)
2. View:
   - Deployment history
   - Build logs
   - Performance metrics
   - Error logs

### 🔧 Cloud Functions (Optional)

#### Setup

```bash
# Initialize functions
firebase init functions

# Deploy functions
firebase deploy --only functions
```

#### Example Function

File: `functions/index.js`

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  // Create user profile in Firestore
  await admin.firestore().collection('users').doc(user.uid).set({
    email: user.email,
    displayName: user.displayName || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});
```

### 📊 Analytics (Google Analytics)

#### Enable

1. Go to Firebase Console → **Analytics**
2. Click **Enable Analytics**
3. Analytics automatically enabled if `VITE_FIREBASE_MEASUREMENT_ID` is set

#### View Data

1. Go to [Google Analytics Console](https://analytics.google.com)
2. Select your Firebase project
3. View user activity, page views, events

## Environment Variables

### Required

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
VITE_FIREBASE_MEASUREMENT_ID          # Google Analytics
VITE_USE_FIREBASE_EMULATORS=false    # Local emulator
```

### Backend (if using server)

```env
FIREBASE_PROJECT_ID=spandex-salvation-radio-site
FIREBASE_CLIENT_EMAIL=your-service-account@...iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=your-private-key
```

## Firebase Emulator (Local Development)

### Setup

```bash
# Install emulator
npm install -g firebase-tools

# Start emulator
firebase emulators:start
```

### Configuration

In `.env.local`:

```env
VITE_USE_FIREBASE_EMULATORS=true
```

In `client/src/firebase.ts`, emulators are connected when this env var is true:

```typescript
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}
```

## Admin SDK (Backend)

### Get Service Account

1. Go to Firebase Console → ⚙️ **Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. Save the JSON file securely

### Use in Backend

```typescript
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = require('./firebase-service-account.json');

const app = initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth(app);
const db = getFirestore(app);

// Create custom token
const customToken = await auth.createCustomToken(uid);

// Get user
const user = await auth.getUser(uid);
```

## Quotas and Limits

### Firestore

- **Free Tier:**
  - 25,000 reads/day
  - 20,000 writes/day
  - 1,000 deletes/day
  - 1 GB storage

- **Paid Tier:**
  - $0.06 per 100K reads
  - $0.18 per 100K writes
  - $0.02 per 100K deletes

### Storage

- **Free Tier:** 5 GB
- **Paid Tier:** $0.18/GB

### Hosting

- **Free Tier:** 10 GB/month
- **Paid Tier:** $0.15/GB after free tier

### Authentication

- **Always Free:** 4,500 SMS sends/month

## Monitoring & Debugging

### Firebase Console Dashboards

1. **Overview** - Project status and quick stats
2. **Analytics** - User behavior and events
3. **Firestore** - Database usage and performance
4. **Storage** - File usage and bandwidth
5. **Functions** - Function execution and logs
6. **Hosting** - Deployments and traffic

### View Logs

```bash
# Firestore operations
firebase logging write "My log message"

# Real-time logs
firebase functions:log
```

### Performance Insights

1. Go to Firebase Console
2. Check each service's usage dashboard
3. Monitor quotas and costs
4. Set up alerts for quota usage

## Troubleshooting

### Firebase Config Missing

**Error:** "No Firebase env vars detected"

**Fix:** Ensure `.env.local` has all required variables:
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
# ... all other required vars
```

### Permission Denied

**Error:** "FirebaseError: Permission denied"

**Cause:** Security rules blocking access

**Fix:**
1. Check Firestore security rules
2. Ensure user is authenticated
3. Verify user UID matches rule conditions

### Quota Exceeded

**Error:** "Quota exceeded for quota metric 'write-ops'"

**Fix:**
1. Upgrade to paid tier
2. Request quota increase
3. Optimize queries and writes

### Emulator Connection Failed

**Error:** "Connection to emulator failed"

**Fix:**
1. Ensure emulator running: `firebase emulators:start`
2. Check emulator ports are open
3. Verify `VITE_USE_FIREBASE_EMULATORS=true`

## Best Practices

### Security

✅ **Do:**
- Use security rules for all data
- Never expose service account keys
- Validate data server-side
- Use HTTPS for all connections
- Enable multi-factor authentication

❌ **Don't:**
- Use production data in development
- Commit `.env.local` to git
- Allow unrestricted database access
- Store sensitive data in Firestore
- Enable rules in test mode in production

### Performance

✅ **Do:**
- Index frequently queried fields
- Use pagination for large datasets
- Cache data locally
- Denormalize data for quick reads
- Use Cloud Functions for heavy operations

❌ **Don't:**
- Create unbounded queries
- Load entire collections
- Ignore index recommendations
- Store large files directly
- Poll frequently

### Costs

✅ **Do:**
- Monitor usage in Firebase Console
- Set up budget alerts
- Use free tier wisely
- Delete old data
- Optimize queries

❌ **Don't:**
- Leave emulators in production
- Create unnecessary writes
- Upload large files repeatedly
- Keep old deployments active
- Ignore quota warnings

## Support & Documentation

- **[Firebase Documentation](https://firebase.google.com/docs)**
- **[Firebase Pricing](https://firebase.google.com/pricing)**
- **[Firebase Status](https://status.firebase.google.com)**
- **[Firebase Community](https://firebase.google.com/community)**

## Getting Help

If you need help with Firebase:

1. Check Firebase Console logs
2. Review Firebase Documentation
3. Search Firebase Community
4. Contact Google Cloud Support (paid plans)

---

**Project ID:** spandex-salvation-radio-site  
**Hosting Region:** us-central1  
**Deployment:** Firebase Hosting  
**Status:** Production Ready
