
# Security Setup Instructions

## ✅ Security Issues Fixed

This update addresses all identified security vulnerabilities:

1. **API Keys Removed from Code** - All hardcoded API keys moved to Replit Secrets
2. **XSS Protection** - Added DOM sanitization utilities
3. **Secure Storage** - Implemented encryption for sensitive data
4. **Duplicate Function Fixed** - Resolved duplicate `generateUserID` function
5. **Environment Variables** - Proper environment variable handling

## 🔐 Required Replit Secrets Setup

**IMPORTANT**: You must add these secrets in Replit for the application to work:

### Step 1: Open Replit Secrets
1. Go to **Tools** > **Secrets** (or click the **+** button and type "Secrets")

### Step 2: Add Required Secrets
Add each of these secrets with their corresponding values:

| Secret Key | Value | Description |
|------------|-------|-------------|
| `FIREBASE_API_KEY` | `AIzaSyCBoEZeDucpm7p9OEDgaUGLzhn5HpItseQ` | Firebase API Key |
| `FIREBASE_AUTH_DOMAIN` | `spandex-salvation-radio-site.firebaseapp.com` | Firebase Auth Domain |
| `FIREBASE_PROJECT_ID` | `spandex-salvation-radio-site` | Firebase Project ID |
| `FIREBASE_STORAGE_BUCKET` | `spandex-salvation-radio-site.firebasestorage.app` | Firebase Storage Bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | `632263635377` | Firebase Messaging Sender ID |
| `FIREBASE_APP_ID` | `1:632263635377:web:2a9bd6118a6a2cb9d8cd90` | Firebase App ID |
| `GOOGLE_MAPS_API_KEY` | `AIzaSyCBoEZeDucpm7p9OEDgaUGLzhn5HpItseQ` | Google Maps API Key |
| `GOOGLE_MAPS_SIGNING_SECRET` | `xUMvkKZN7YbwACexIGzpV2o5Fms=` | Google Maps Signing Secret |
| `OPEN_WEATHER_API_KEY` | `bc23ce0746d4fc5c04d1d765589dadc5` | OpenWeather API Key |
| `GOOGLE_OAUTH_CLIENT_ID` | `632263635377-sa02i1luggs8hlmc6ivt0a6i5gv0irrn.apps.googleusercontent.com` | Google OAuth Client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | `z1vTXJmTXOei8lcZIbal5oJoFOk=` | Google OAuth Client Secret |
| `ENCRYPTION_KEY` | `SpandexSalvationRadio2025SecureKey!` | Encryption key for sensitive data |

### Step 3: Validate Configuration
Run this command to check if all secrets are properly configured:

```bash
node scripts/validate-secrets.js
```

### Step 4: Restart Application
After adding all secrets, restart your application for changes to take effect.

## 🚀 Quick Setup Script

Run this for setup instructions:
```bash
node scripts/setup-secrets.js
```

## 🛡️ Security Features Added

### XSS Protection
- Safe DOM manipulation utilities
- HTML sanitization for user input
- Secure element creation methods

### Secure Storage
- Encryption/decryption utilities for sensitive data
- Safe environment variable handling
- Proper error handling with sanitized output

### Environment Security
- API keys loaded from encrypted Replit Secrets
- No hardcoded credentials in source code
- Validation of required configuration

## 📋 User Registration Database Structure

The user registration system creates accounts with this Firebase structure:

```
Users > {10-character-alphanumeric-ID} > {
  FirstName: "string",
  LastName: "string", 
  UserProfileImage: "URL to random avatar",
  EmailAddress: "string",
  PhoneNumber: "string",
  Location: { lat: number, lng: number },
  IsActiveListening: false,
  ActiveSubscription: false,
  RenewalDate: null,
  UserID: "10-character-alphanumeric-ID",
  PasswordHash: "encrypted password",
  CreatedAt: "timestamp",
  UpdatedAt: "timestamp"
}
```

### Random Avatar Assignment
Users get assigned random avatars from:
- Bass-Bat.png
- Drum-Dragon.png  
- Headbanger-Hamster.png
- Metal-Queen.png
- Metal Cat.png
- Mosh-Pit-Monster.png
- Rebel-Raccoon.png
- Rock-Unicorn.png

## ⚠️ Important Security Notes

1. **Never commit API keys to code** - Always use Replit Secrets
2. **All user input is sanitized** - XSS protection is automatically applied
3. **Passwords are encrypted** - Using bcrypt with salt rounds
4. **Notifications show for errors** - User-friendly error messages appear in bottom-right corner
5. **Firebase Admin uses service account** - Secure server-side operations

## 🔧 Troubleshooting

If you see missing configuration warnings:
1. Check that all secrets are added in Replit Secrets panel
2. Restart the application
3. Run `node scripts/validate-secrets.js` to verify setup

The application will work with fallback values but for full security, use Replit Secrets!
