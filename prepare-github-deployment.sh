
#!/bin/bash

echo "🚀 Preparing Spandex Salvation Radio for GitHub Deployment"
echo "=================================================="

# Create deployment package directory
mkdir -p github-deployment-package

# Copy all necessary files
echo "📦 Copying project files..."
cp -r client github-deployment-package/
cp -r server github-deployment-package/
cp -r shared github-deployment-package/
cp -r functions github-deployment-package/
cp -r .github github-deployment-package/
cp -r attached_assets github-deployment-package/

# Copy configuration files
cp package.json github-deployment-package/
cp package-lock.json github-deployment-package/
cp tsconfig.json github-deployment-package/
cp firebase.json github-deployment-package/
cp .firebaserc github-deployment-package/
cp components.json github-deployment-package/
cp drizzle.config.ts github-deployment-package/
cp eslint.config.js github-deployment-package/

# Copy documentation
cp README.md github-deployment-package/
cp LICENSE github-deployment-package/
cp GITHUB_DEPLOYMENT.md github-deployment-package/
cp DEPLOYMENT_SUCCESS.md github-deployment-package/
cp MANUAL_GITHUB_SETUP.md github-deployment-package/

# Copy environment template
cp .env.template github-deployment-package/

# Create .gitignore for GitHub
cat > github-deployment-package/.gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Firebase
.firebase/
firebase-debug.log
firebase-service-account.json

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build directory
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/
EOF

# Create deployment instructions
cat > github-deployment-package/DEPLOY_TO_GITHUB.md << 'EOF'
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
EOF

echo "✅ GitHub deployment package prepared!"
echo ""
echo "📋 Next Steps:"
echo "1. Run this script: ./prepare-github-deployment.sh"
echo "2. Download the 'github-deployment-package' folder"
echo "3. Follow instructions in DEPLOY_TO_GITHUB.md"
echo ""
echo "🌐 Your app will be deployed to:"
echo "   https://spandex-salvation-radio-site.web.app"

chmod +x github-deployment-package/DEPLOY_TO_GITHUB.md
