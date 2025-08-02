# Deploy to GitHub - Quick Setup

## Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `spandex-salvation-radio`
3. Set as Public
4. Don't initialize with README (we have one)

## Step 2: Upload Files
1. Download this entire `github-deployment-package` folder
2. Extract to your local machine
3. Open terminal in the project folder

## Step 3: Initialize Git and Push
```bash
git init
git add .
git commit -m "Initial commit: Spandex Salvation Radio streaming platform

✅ Complete React + TypeScript frontend
✅ Express.js + PostgreSQL backend  
✅ Firebase authentication system
✅ 8 premium themes with adaptive theming
✅ Live radio streaming (4 stations)
✅ Real-time metadata with iTunes integration
✅ Interactive global listener map
✅ Mobile-responsive design
✅ WCAG 2.1 AA accessibility compliance
✅ Stripe payment integration
✅ Shopify e-commerce integration
✅ Live chat functionality
✅ Admin dashboard
✅ Firebase hosting deployment ready
✅ GitHub Actions CI/CD workflow"

git remote add origin https://github.com/YOUR_USERNAME/spandex-salvation-radio.git
git branch -M main
git push -u origin main
```

## Step 4: Configure GitHub Secrets
Go to Settings > Secrets and variables > Actions and add:
- FIREBASE_SERVICE_ACCOUNT
- FIREBASE_TOKEN
- DATABASE_URL
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_MAPS_API_KEY

## Step 5: Enable GitHub Actions
The workflow will automatically deploy to Firebase Hosting!

🎉 Your app will be live at: https://spandex-salvation-radio-site.web.app
