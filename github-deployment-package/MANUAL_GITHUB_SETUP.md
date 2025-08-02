# 📋 Manual GitHub Repository Setup

Since git operations are restricted in this Replit environment, follow these steps to manually create your GitHub repository:

## Step 1: Download Project Files

1. **Download all files** from this Replit workspace
2. **Create local folder**: `spandex-salvation-radio`
3. **Extract all files** to the local folder

## Step 2: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click **"New repository"**
3. Repository name: `spandex-salvation-radio`
4. Set as **Public** (recommended)
5. **DO NOT** initialize with README, .gitignore, or license (we have these)
6. Click **"Create repository"**

## Step 3: Initialize Git and Push

Open terminal in your project folder and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
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

# Add your GitHub repository as origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/spandex-salvation-radio.git

# Set main branch and push
git branch -M main
git push -u origin main
```

## Step 4: Configure GitHub Secrets

Go to your repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

### 🔐 Required Secrets

```
FIREBASE_SERVICE_ACCOUNT
FIREBASE_TOKEN
DATABASE_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_MAPS_API_KEY
OPENWEATHER_API_KEY
RADIO_CO_API_KEY
LASTFM_API_KEY
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
```

### 🔥 Firebase Token Generation

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Generate deployment token
firebase login:ci

# Copy the generated token → Add as FIREBASE_TOKEN secret
```

## Step 5: Enable GitHub Actions

1. Go to **Actions** tab in your repository
2. GitHub will detect the workflow file
3. Click **"I understand my workflows, go ahead and enable them"**
4. The deployment workflow will run automatically on push to main

## Step 6: Configure Branch Protection

1. Go to **Settings** → **Branches**
2. Click **"Add rule"**
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

## Step 7: Set Up Custom Domain (Optional)

If you want a custom domain:

1. **Firebase Console** → Hosting → Add custom domain
2. Follow Firebase instructions for DNS setup
3. Update `firebase.json` site configuration

## 🚀 Automated Deployment Flow

Once set up, your workflow will be:

1. **Development**: Make changes locally
2. **Commit**: `git commit -m "Your changes"`
3. **Push**: `git push origin main`
4. **GitHub Actions**: Automatically builds and deploys
5. **Live Site**: Updates at https://spandex-salvation-radio-site.web.app

## 📁 Repository Structure

Your GitHub repository will contain:

```
spandex-salvation-radio/
├── .github/workflows/deploy.yml    # CI/CD automation
├── client/                         # React frontend
├── server/                         # Express backend
├── shared/                         # TypeScript schemas
├── functions/                      # Firebase functions
├── firebase.json                   # Firebase config
├── package.json                    # Dependencies
├── README.md                       # Project documentation
├── DEPLOYMENT_SUCCESS.md           # Deployment info
├── GITHUB_DEPLOYMENT.md            # Detailed deployment guide
└── replit.md                       # Project architecture
```

## ✅ Verification

After setup, verify everything works:

1. **Repository**: Check all files are uploaded
2. **Actions**: First workflow should run successfully
3. **Secrets**: All required secrets are configured
4. **Deployment**: Site deploys to Firebase
5. **Domain**: Custom domain works (if configured)

## 🆘 Troubleshooting

### Build Fails
- Check all environment variables are set
- Verify Firebase token is valid
- Ensure Node.js version is 20+ in workflow

### Deployment Fails
- Check Firebase project permissions
- Verify service account has Hosting Admin role
- Ensure firebase.json is properly configured

### Secrets Missing
- Double-check secret names match exactly
- Regenerate tokens if expired
- Verify permissions for service accounts

## 🎯 Next Steps

1. **Custom Domain**: Set up your own domain
2. **Monitoring**: Configure Firebase Analytics
3. **SEO**: Add meta tags and sitemap
4. **CDN**: Optimize global performance
5. **Security**: Enable additional Firebase security rules

---

**Repository URL**: `https://github.com/YOUR_USERNAME/spandex-salvation-radio`

**Live Site**: `https://spandex-salvation-radio-site.web.app`

🎸 **Your radio station is ready to rock!** 🎸