# 🚀 GitHub Actions Setup Guide

This guide will help you configure GitHub Actions to automatically deploy your Spandex Salvation Radio app to Firebase.

## 📋 Prerequisites

- ✅ GitHub repository deployed (already completed!)
- ✅ Firebase project configured
- ✅ Firebase CLI installed locally

## 🔐 Required GitHub Secrets

Go to your repository: https://github.com/mechmatt01/Replit-Spandex-Revolution-Radio-Website-V2

Navigate to **Settings → Secrets and variables → Actions**

### **1. FIREBASE_SERVICE_ACCOUNT**

This is your Firebase service account JSON file content.

**How to get it:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `spandex-salvation-radio-site`
3. Go to **Project Settings → Service accounts**
4. Click **Generate new private key**
5. Download the JSON file
6. Copy the **entire content** of the JSON file
7. Paste it as the secret value

**⚠️ Important:** Copy the ENTIRE JSON content, not just parts of it.

### **2. FIREBASE_TOKEN**

This is your Firebase CLI token for authentication.

**How to get it:**
1. Open your terminal
2. Run: `firebase login:ci`
3. Follow the authentication process
4. Copy the token that appears
5. Paste it as the secret value

**Example:**
```bash
firebase login:ci
# Follow the browser authentication
# Copy the token that appears
```

### **3. DATABASE_URL**

Your PostgreSQL database connection string.

**Format:** `postgresql://username:password@host:port/database`

**Example:**
```
postgresql://myuser:mypassword@localhost:5432/spandex_radio
```

### **4. GOOGLE_CLIENT_ID**

Your Google OAuth client ID.

**How to get it:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services → Credentials**
4. Find your OAuth 2.0 Client ID
5. Copy the Client ID

### **5. GOOGLE_CLIENT_SECRET**

Your Google OAuth client secret.

**How to get it:**
1. Same location as above
2. Click on your OAuth 2.0 Client ID
3. Copy the Client Secret

### **6. GOOGLE_MAPS_API_KEY**

Your Google Maps API key.

**How to get it:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → API Key**
5. Copy the API key

## 🎯 Setting Up the Secrets

1. **Go to your repository settings**
2. **Click "Secrets and variables" → "Actions"**
3. **Click "New repository secret"**
4. **Add each secret one by one:**

| Secret Name | Value |
|-------------|-------|
| `FIREBASE_SERVICE_ACCOUNT` | Entire JSON content from service account file |
| `FIREBASE_TOKEN` | Token from `firebase login:ci` |
| `DATABASE_URL` | Your PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth client secret |
| `GOOGLE_MAPS_API_KEY` | Your Google Maps API key |

## ✅ Enable GitHub Actions

1. **Go to your repository**
2. **Click "Actions" tab**
3. **You should see the workflow files**
4. **Click on "Deploy to Firebase"**
5. **Click "Enable workflow"**

## 🚀 How It Works

### **Automatic Deployment**
- **Trigger**: Every push to `main` branch
- **Process**: Build → Test → Deploy to Firebase
- **Result**: Your app is automatically live!

### **Manual Deployment**
- **Trigger**: Go to Actions → Deploy to Firebase → Run workflow
- **Use case**: When you want to deploy without pushing code

## 📊 What Gets Deployed

- ✅ **Frontend**: React app (built and optimized)
- ✅ **Backend**: Express.js server
- ✅ **Functions**: Firebase Cloud Functions
- ✅ **Hosting**: Firebase Hosting
- ✅ **Performance Monitoring**: Automatically active

## 🔍 Monitoring Your Deployments

1. **Go to Actions tab** to see deployment status
2. **Check Firebase Console** for hosting status
3. **View Performance data** in Firebase Performance Monitoring

## 🛠️ Troubleshooting

### **Common Issues:**

#### **1. "FIREBASE_SERVICE_ACCOUNT not found"**
- Make sure you copied the ENTIRE JSON content
- Check for extra spaces or characters

#### **2. "FIREBASE_TOKEN invalid"**
- Run `firebase login:ci` again
- Generate a new token

#### **3. "Build failed"**
- Check your code for syntax errors
- Ensure all dependencies are in package.json

#### **4. "Deployment failed"**
- Verify your Firebase project ID
- Check Firebase Console for errors

### **Getting Help:**
1. Check the Actions tab for detailed error logs
2. Verify all secrets are set correctly
3. Test Firebase deployment locally first

## 🎉 Success Indicators

When everything is working:
- ✅ GitHub Actions show green checkmarks
- ✅ Your app is live at: https://spandex-salvation-radio-site.web.app
- ✅ Firebase Console shows successful deployments
- ✅ Performance monitoring is collecting data

## 🎸 Rock On!

Once configured, your deployment pipeline will be:
1. **Push code** to GitHub
2. **GitHub Actions** automatically build and deploy
3. **Firebase** hosts your app
4. **Performance monitoring** tracks user experience
5. **Your radio station** is always up-to-date!

---

**Need help?** Check the Actions tab logs or Firebase Console for detailed error information.
