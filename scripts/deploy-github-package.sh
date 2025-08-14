#!/bin/bash

# GitHub Deployment Package Script for Spandex Salvation Radio
# This script deploys the prepared GitHub deployment package to GitHub
# Run this command from the root project directory
# ./scripts/deploy-github-package.sh

echo "🚀 Starting GitHub Deployment Package deployment for Spandex Salvation Radio..."
echo "=================================================================="

# Check if we're in the correct directory (should be project root)
if [ ! -f "package.json" ]; then
    echo "❌ Error: This script must be run from the project root directory!"
    echo "   Current directory: $(pwd)"
    echo "   Expected to find: package.json"
    exit 1
fi

# Check if the deployment package exists
if [ ! -d "scripts/github-deployment-package/github-deployment-package" ]; then
    echo "❌ GitHub deployment package not found!"
    echo "   Please run the prepare script first:"
    echo "   ./scripts/github-deployment-package/prepare-github-deployment.sh"
    exit 1
fi


echo "✅ Found GitHub deployment package"

# Navigate to the deployment package directory
cd scripts/github-deployment-package/github-deployment-package

echo ""
echo "📍 Current directory: $(pwd)"
echo "📦 Deployment package contents:"
ls -la
echo ""

echo ""
echo "📋 Verifying deployment package contents..."
echo "=========================================="

# Check for essential files and directories
required_items=(
    "client"
    "server" 
    "shared"
    "functions"
    ".github"
    "package.json"
    "package-lock.json"
    "tsconfig.json"
    "firebase.json"
    ".firebaserc"
    "components.json"
    "drizzle.config.ts"
    "eslint.config.js"
    "README.md"
    "LICENSE"
    ".gitignore"
)

missing_items=()
for item in "${required_items[@]}"; do
    if [ ! -e "$item" ]; then
        missing_items+=("$item")
    else
        echo "✅ $item"
    fi
done

if [ ${#missing_items[@]} -gt 0 ]; then
    echo ""
    echo "❌ Missing required items:"
    for item in "${missing_items[@]}"; do
        echo "   - $item"
    done
    echo ""
    echo "Please run the prepare script again to ensure all files are copied."
    exit 1
fi

echo ""
echo "✅ All required files present!"

# Check if this is already a git repository
if [ -d ".git" ]; then
    echo "⚠️  This directory is already a git repository."
    current_remote=$(git remote get-url origin 2>/dev/null || echo 'No remote')
    echo "Current remote: $current_remote"
    echo ""
    
    if [ "$current_remote" = "No remote" ]; then
        echo "✅ Git repository exists but has no remote - perfect for new deployment!"
        echo "🔄 Will add new remote origin..."
    else
        echo "Choose an option:"
        echo "1. Create new repository (recommended for deployment package)"
        echo "2. Update existing repository remote"
        echo "3. Cancel deployment"
        read -p "🤔 Enter your choice (1-3): " git_choice
        
        case $git_choice in
            1)
                echo "🗑️  Removing existing git repository..."
                rm -rf .git
                echo "📝 Initializing new git repository..."
                git init
                ;;
            2)
                echo "🔄 Using existing git repository..."
                # Remove existing remote if it exists
                git remote remove origin 2>/dev/null || true
                ;;
            3)
                echo "❌ Deployment cancelled."
                exit 1
                ;;
            *)
                echo "❌ Invalid choice. Deployment cancelled."
                exit 1
                ;;
        esac
    fi
else
    echo "📝 Initializing git repository..."
    git init
fi

echo ""
echo "🔧 Git Operations..."
echo "=================="

# Add all files
echo "➕ Adding all files to git..."
git add .

# Check if there are any files to commit
if git diff --cached --quiet && git diff --quiet; then
    echo "ℹ️  No new changes to commit - files are already committed."
    echo "✅ Ready to push to GitHub!"
else
    echo "📝 Changes detected - will commit them..."
fi

# Only commit if there are changes to commit
if ! git diff --cached --quiet || ! git diff --quiet; then
    # Check if this is a new repository or updating existing
    if [ ! -f ".git/HEAD" ] || [ ! -s ".git/HEAD" ]; then
        # New repository - create initial commit
        echo "💾 Creating initial commit..."
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
    else
        # Existing repository - create deployment commit
        echo "💾 Creating deployment commit..."
        git commit -m "Deploy: Spandex Salvation Radio streaming platform

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
    fi

    if [ $? -ne 0 ]; then
        echo "❌ Failed to create commit!"
        exit 1
    fi

    echo "✅ Commit created successfully!"
else
    echo "✅ No changes to commit - files are already committed!"
fi

# Rename branch to main
echo "🌿 Setting branch to main..."
git branch -M main

echo ""
echo "🌐 GitHub Repository Setup..."
echo "============================"

# Set the correct repository URL
github_username="mechmatt01"
repo_name="Replit-Spandex-Revolution-Radio-Website-V2"
repo_url="https://github.com/$github_username/$repo_name.git"

echo "🎯 Using repository: $repo_url"

echo ""
echo "🔗 Repository URL: $repo_url"

# Add remote origin
echo "🔗 Adding remote origin..."
git remote add origin "$repo_url"

if [ $? -ne 0 ]; then
    echo "❌ Failed to add remote origin!"
    exit 1
fi

echo "✅ Remote origin added successfully!"

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
echo "====================="

echo "📤 Pushing to GitHub repository..."
echo "🚀 Force pushing to GitHub (this will overwrite remote content)..."
git push -u origin main --force

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your Spandex Salvation Radio project has been deployed to GitHub!"
    echo "=========================================================================="
    echo ""
    echo "📋 Next Steps:"
    echo "1. Visit your repository: https://github.com/$github_username/$repo_name"
    echo "2. Go to Settings > Secrets and variables > Actions"
    echo "3. Add the following secrets:"
    echo "   - FIREBASE_SERVICE_ACCOUNT"
    echo "   - FIREBASE_TOKEN" 
    echo "   - DATABASE_URL"
    echo "   - GOOGLE_CLIENT_ID"
    echo "   - GOOGLE_CLIENT_SECRET"
    echo "   - GOOGLE_MAPS_API_KEY"
    echo ""
    echo "4. Enable GitHub Actions in your repository"
    echo "5. The workflow will automatically deploy to Firebase Hosting!"
    echo ""
    echo "🌐 Your app will be live at: https://spandex-salvation-radio-site.web.app"
    echo "🎸 Rock on! Your radio station is ready to rock! 🎸"
else
    echo ""
    echo "❌ Failed to push to GitHub!"
    echo "This might be because:"
    echo "1. The repository doesn't exist yet"
    echo "2. You don't have permission to push to this repository"
    echo "3. You need to create the repository first at: https://github.com/new"
    echo ""
    echo "Please create the repository manually and try again."
    exit 1
fi

# Return to original directory
cd ../../..

echo ""
echo "✅ Deployment script completed!"
