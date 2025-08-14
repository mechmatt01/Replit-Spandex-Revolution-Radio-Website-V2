
#!/bin/bash

# This script is used to prepare the project for deployment to GitHub.
# It copies the necessary files to the github-deployment-package directory.
# It also creates a .gitignore file and a DEPLOY_TO_GITHUB.md file.
# It also creates a progress bar for the copying process.
# It also creates a safe_copy function to safely copy files with error checking.
# It also creates a update_progress function to update the progress bar.

# Run this command from the root project directory
# ./scripts/github-deployment-package/prepare-github-deployment.sh

# Function to update progress - must be defined before use
update_progress() {
    current_operation=$((current_operation + 1))
    percentage=$((current_operation * 100 / total_operations))
    filled=$((percentage / 10))
    empty=$((10 - filled))
    
    # Create progress bar
    bar=""
    for ((i=0; i<filled; i++)); do bar="${bar}█"; done
    for ((i=0; i<empty; i++)); do bar="${bar}░"; done
    
    echo -ne "\rProgress: [${bar}] ${percentage}% - $1"
}

# Function to safely copy files with error checking
safe_copy() {
    local source="$1"
    local dest="$2"
    local description="$3"
    
    if [ -e "$source" ]; then
        update_progress "$description"
        cp -r "$source" "$dest" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo " ✅"
        else
            echo " ❌ (Failed)"
        fi
    else
        echo "⚠️  Skipping $description - file not found: $source"
    fi
}

echo "🚀 Preparing Spandex Salvation Radio for GitHub Deployment"
echo "=================================================="

# Create deployment package directory
mkdir -p github-deployment-package

# Copy all necessary files
echo "📦 Copying project files..."
echo "Progress: [░░░░░░░░░░] 0%"

# Define total number of operations for progress calculation (updated based on actual files)
total_operations=15
current_operation=0

echo "🔄 Copying directories..."
safe_copy "../../client" "github-deployment-package/" "Copying client directory"
safe_copy "../../server" "github-deployment-package/" "Copying server directory"
safe_copy "../../shared" "github-deployment-package/" "Copying shared directory"
safe_copy "../../functions" "github-deployment-package/" "Copying functions directory"
safe_copy "../../.github" "github-deployment-package/" "Copying .github directory"

echo ""
echo "📄 Copying configuration files..."
safe_copy "../../package.json" "github-deployment-package/" "Copying package.json"
safe_copy "../../package-lock.json" "github-deployment-package/" "Copying package-lock.json"
safe_copy "../../tsconfig.json" "github-deployment-package/" "Copying tsconfig.json"
safe_copy "../../firebase.json" "github-deployment-package/" "Copying firebase.json"
safe_copy "../../.firebaserc" "github-deployment-package/" "Copying .firebaserc"
safe_copy "../../components.json" "github-deployment-package/" "Copying components.json"
safe_copy "../../drizzle.config.ts" "github-deployment-package/" "Copying drizzle.config.ts"
safe_copy "../../eslint.config.js" "github-deployment-package/" "Copying eslint.config.js"

echo ""
echo "📚 Copying documentation files..."
safe_copy "../../README.md" "github-deployment-package/" "Copying README.md"
safe_copy "../../LICENSE" "github-deployment-package/" "Copying LICENSE"

echo ""
echo "✅ File copying completed!"

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
