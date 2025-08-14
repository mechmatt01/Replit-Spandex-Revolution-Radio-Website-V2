#!/bin/bash

# This script prepares the project for deployment to GitHub.
# It creates a clean deployment package in the root directory.
# Run this command from the root project directory: ./scripts/prepare-github-deployment.sh

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

# Check if we're in the root directory
if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
    echo "❌ Error: This script must be run from the root project directory!"
    echo "Please run: ./scripts/prepare-github-deployment.sh"
    exit 1
fi

# Remove existing deployment package if it exists
if [ -d "github-deployment-package" ]; then
    echo "🗑️  Removing existing deployment package..."
    rm -rf github-deployment-package
fi

# Create fresh deployment package directory
echo "📁 Creating fresh deployment package directory..."
mkdir -p github-deployment-package

# Copy all necessary files
echo "📦 Copying project files..."
echo "Progress: [░░░░░░░░░░] 0%"

# Define total number of operations for progress calculation
total_operations=15
current_operation=0

echo "🔄 Copying directories..."
safe_copy "client" "github-deployment-package/" "Copying client directory"
safe_copy "server" "github-deployment-package/" "Copying server directory"
safe_copy "shared" "github-deployment-package/" "Copying shared directory"
safe_copy "functions" "github-deployment-package/" "Copying functions directory"
safe_copy ".github" "github-deployment-package/" "Copying .github directory"

echo ""
echo "📄 Copying configuration files..."
safe_copy "package.json" "github-deployment-package/" "Copying package.json"
safe_copy "package-lock.json" "github-deployment-package/" "Copying package-lock.json"
safe_copy "tsconfig.json" "github-deployment-package/" "Copying tsconfig.json"
safe_copy "firebase.json" "github-deployment-package/" "Copying firebase.json"
safe_copy ".firebaserc" "github-deployment-package/" "Copying .firebaserc"
safe_copy "components.json" "github-deployment-package/" "Copying components.json"
safe_copy "drizzle.config.ts" "github-deployment-package/" "Copying drizzle.config.ts"
safe_copy "eslint.config.js" "github-deployment-package/" "Copying eslint.config.js"

echo ""
echo "📚 Copying documentation files..."
safe_copy "README.md" "github-deployment-package/" "Copying README.md"
safe_copy "LICENSE" "github-deployment-package/" "Copying LICENSE"

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
firebase-debug.*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

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

# nyc test coverage
.nyc_output

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

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port
EOF

# Create DEPLOY_TO_GITHUB.md
cat > github-deployment-package/DEPLOY_TO_GITHUB.md << 'EOF'
# 🚀 Deploy to GitHub

This package is ready for deployment to GitHub!

## 📋 Next Steps:

1. **Navigate to the deployment package:**
   ```bash
   cd github-deployment-package
   ```

2. **Run the deployment script:**
   ```bash
   ../scripts/deploy-github-package.sh
   ```

3. **Or manually deploy:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Spandex Salvation Radio"
   git branch -M main
   git remote add origin https://github.com/mechmatt01/Replit-Spandex-Revolution-Radio-Website-V2.git
   git push -u origin main --force
   ```

## 🎯 What's Included:

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
✅ GitHub Actions CI/CD workflow  

## 🌐 After Deployment:

Your app will be live at: https://spandex-salvation-radio-site.web.app

## 🎸 Rock on! Your radio station is ready to deploy! 🎸
EOF

echo ""
echo "🎉 GitHub Deployment Package Created Successfully!"
echo "=================================================="
echo ""
echo "📁 Package location: ./github-deployment-package/"
echo "📋 Next step: cd github-deployment-package && ../scripts/deploy-github-package.sh"
echo ""
echo "✅ Ready for deployment! 🚀"
