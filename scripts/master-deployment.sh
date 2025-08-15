#!/bin/bash

# 🚀 MASTER DEPLOYMENT SCRIPT - Spandex Salvation Radio
# This script combines ALL deployment functionality with error checking and fixes
# Run this command from the root project directory: ./scripts/master-deployment.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if we're in the right directory
check_directory() {
    if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
        print_status $RED "❌ Error: This script must be run from the root project directory!"
        print_status $YELLOW "Please run: ./scripts/master-deployment.sh"
        exit 1
    fi
    print_status $GREEN "✅ Root project directory confirmed"
}

# Function to check and fix Firebase configuration
fix_firebase_config() {
    print_status $BLUE "🔧 Checking Firebase configuration..."
    
    # Check if firebase.json has the correct target
    if grep -q '"target": "main"' firebase.json; then
        print_status $YELLOW "⚠️  Updating firebase.json target from 'main' to 'spandex-salvation-radio-site'..."
        sed -i '' 's/"target": "main"/"target": "spandex-salvation-radio-site"/g' firebase.json
        print_status $GREEN "✅ firebase.json updated"
    fi
    
    # Check if .firebaserc has the correct hosting target
    if grep -q '"main": \[' .firebaserc; then
        print_status $YELLOW "⚠️  Updating .firebaserc hosting target from 'main' to 'spandex-salvation-radio-site'..."
        sed -i '' 's/"main": \[/"spandex-salvation-radio-site": [/g' .firebaserc
        print_status $GREEN "✅ .firebaserc updated"
    fi
    
    print_status $GREEN "✅ Firebase configuration verified and fixed"
}

# Function to check Git status and handle issues
check_git_status() {
    print_status $BLUE "🔍 Checking Git status..."
    
    if [ ! -d ".git" ]; then
        print_status $YELLOW "⚠️  No Git repository found. Initializing..."
        git init
        git add .
        git commit -m "Initial commit: Spandex Salvation Radio"
        print_status $GREEN "✅ Git repository initialized"
        return
    fi
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        print_status $YELLOW "📋 You have uncommitted changes."
        read -p "🤔 Would you like to commit them now? (y/n/cancel): " commit_changes
        
        if [ "$commit_changes" = "cancel" ]; then
            print_status $RED "❌ Deployment cancelled by user."
            exit 0
        elif [[ $commit_changes =~ ^[Yy]$ ]]; then
            git add .
            read -p "💬 Enter commit message or press Enter for default: " commit_message
            if [ -z "$commit_message" ]; then
                commit_message="Update: Spandex Salvation Radio - $(date '+%Y-%m-%d %H:%M:%S')"
            fi
            git commit -m "$commit_message"
            print_status $GREEN "✅ Changes committed"
        fi
    fi
    
    # Check for remote and handle divergent histories
    if git remote get-url origin >/dev/null 2>&1; then
        print_status $BLUE "🌐 Remote origin found. Checking for divergent histories..."
        
        # Fetch latest from remote
        git fetch origin
        
        # Check if local and remote have diverged
        if ! git merge-base --is-ancestor HEAD origin/main 2>/dev/null; then
            print_status $YELLOW "⚠️  Local and remote branches have diverged."
            print_status $YELLOW "This is normal after multiple deployments."
            print_status $GREEN "✅ Git status ready for deployment"
        fi
    else
        print_status $YELLOW "⚠️  No remote origin configured."
        print_status $GREEN "✅ Git status ready for deployment"
    fi
}

# Function to create GitHub deployment package
create_deployment_package() {
    print_status $BLUE "📦 Creating GitHub deployment package..."
    
    # Remove existing package if it exists
    if [ -d "github-deployment-package" ]; then
        print_status $YELLOW "🗑️  Removing existing deployment package..."
        rm -rf github-deployment-package
    fi
    
    # Create fresh package
    mkdir -p github-deployment-package
    
    # Copy all necessary files with progress
    print_status $BLUE "🔄 Copying project files..."
    
    # Directories
    cp -r client github-deployment-package/ && print_status $GREEN "✅ client/"
    cp -r server github-deployment-package/ && print_status $GREEN "✅ server/"
    cp -r shared github-deployment-package/ && print_status $GREEN "✅ shared/"
    cp -r functions github-deployment-package/ && print_status $GREEN "✅ functions/"
    cp -r .github github-deployment-package/ && print_status $GREEN "✅ .github/"
    
    # Configuration files
    cp package.json github-deployment-package/ && print_status $GREEN "✅ package.json"
    cp package-lock.json github-deployment-package/ && print_status $GREEN "✅ package-lock.json"
    cp tsconfig.json github-deployment-package/ && print_status $GREEN "✅ tsconfig.json"
    cp firebase.json github-deployment-package/ && print_status $GREEN "✅ firebase.json"
    cp .firebaserc github-deployment-package/ && print_status $GREEN "✅ .firebaserc"
    cp components.json github-deployment-package/ && print_status $GREEN "✅ components.json"
    cp drizzle.config.ts github-deployment-package/ && print_status $GREEN "✅ drizzle.config.ts"
    cp eslint.config.js github-deployment-package/ && print_status $GREEN "✅ eslint.config.js"
    
    # Documentation
    cp README.md github-deployment-package/ && print_status $GREEN "✅ README.md"
    cp LICENSE github-deployment-package/ && print_status $GREEN "✅ LICENSE"
    
    # Create .gitignore for deployment package
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

    print_status $GREEN "✅ GitHub deployment package created successfully!"
}

# Function to deploy to GitHub
deploy_to_github() {
    print_status $BLUE "🚀 Deploying to GitHub..."
    
    cd github-deployment-package
    
    # Initialize git if needed
    if [ ! -d ".git" ]; then
        git init
    fi
    
    # Add all files
    git add .
    
    # Check if there are changes to commit
    if ! git diff --cached --quiet; then
        git commit -m "Deploy: Spandex Salvation Radio streaming platform - $(date '+%Y-%m-%d %H:%M:%S')"
        print_status $GREEN "✅ Changes committed"
    fi
    
    # Set branch to main
    git branch -M main
    
    # Add remote origin
    github_username="mechmatt01"
    repo_name="Replit-Spandex-Revolution-Radio-Website-V2"
    repo_url="https://github.com/$github_username/$repo_name.git"
    
    # Remove existing remote if it exists
    git remote remove origin 2>/dev/null || true
    git remote add origin "$repo_url"
    
    print_status $BLUE "📤 Pushing to GitHub repository..."
    print_status $YELLOW "⚠️  This will overwrite the remote repository content."
    read -p "🤔 Continue with force push? (y/n/cancel): " confirm_push
    
    if [ "$confirm_push" = "cancel" ]; then
        print_status $RED "❌ GitHub deployment cancelled by user."
        cd ..
        return 1
    elif [[ ! $confirm_push =~ ^[Yy]$ ]]; then
        print_status $RED "❌ GitHub deployment cancelled by user."
        cd ..
        return 1
    fi
    
    # Force push to GitHub
    if git push -u origin main --force; then
        print_status $GREEN "🎉 SUCCESS! Deployed to GitHub!"
        print_status $BLUE "📋 Next Steps:"
        print_status $BLUE "1. Visit: https://github.com/$github_username/$repo_name"
        print_status $BLUE "2. Go to Settings > Secrets and variables > Actions"
        print_status $BLUE "3. Add required secrets for GitHub Actions"
        print_status $BLUE "4. Enable GitHub Actions for automatic Firebase deployment"
    else
        print_status $RED "❌ Failed to push to GitHub!"
        cd ..
        return 1
    fi
    
    cd ..
}

# Function to deploy to Firebase
deploy_to_firebase() {
    print_status $BLUE "🔥 Deploying to Firebase..."
    
    # Check Firebase CLI
    if ! command -v firebase &> /dev/null; then
        print_status $RED "❌ Firebase CLI not found!"
        print_status $YELLOW "Please install Firebase CLI: npm install -g firebase-tools"
        return 1
    fi
    
    # Check if logged in
    if ! firebase projects:list &> /dev/null; then
        print_status $YELLOW "⚠️  Not logged into Firebase. Please login..."
        firebase login
    fi
    
    # Check if client is already built
    if [ ! -d "client/dist" ] || [ -z "$(ls -A client/dist 2>/dev/null)" ]; then
        print_status $YELLOW "⚠️  Client not built. Building now..."
        read -p "🤔 Continue with client build? (y/n/cancel): " confirm_build
        
        if [ "$confirm_build" = "cancel" ]; then
            print_status $RED "❌ Build cancelled by user."
            return 1
        elif [[ ! $confirm_build =~ ^[Yy]$ ]]; then
            print_status $RED "❌ Build cancelled by user."
            return 1
        fi
        
        cd client
        if ! npm run build; then
            print_status $RED "❌ Client build failed!"
            cd ..
            return 1
        fi
        cd ..
        print_status $GREEN "✅ Client build successful!"
    else
        print_status $GREEN "✅ Client already built, skipping build step"
    fi
    
    # Deploy Functions
    print_status $BLUE "⚡ Deploying Firebase Functions..."
    read -p "🤔 Continue with Functions deployment? (y/n/cancel): " confirm_functions
    
    if [ "$confirm_functions" = "cancel" ]; then
        print_status $RED "❌ Functions deployment cancelled by user."
        return 1
    elif [[ ! $confirm_functions =~ ^[Yy]$ ]]; then
        print_status $RED "❌ Functions deployment cancelled by user."
        return 1
    fi
    
    if firebase deploy --only functions; then
        print_status $GREEN "✅ Functions deployment successful!"
    else
        print_status $RED "❌ Functions deployment failed!"
        return 1
    fi
    
    # Deploy Hosting
    print_status $BLUE "🚀 Deploying to Firebase Hosting..."
    read -p "🤔 Continue with Hosting deployment? (y/n/cancel): " confirm_hosting
    
    if [ "$confirm_hosting" = "cancel" ]; then
        print_status $RED "❌ Hosting deployment cancelled by user."
        return 1
    elif [[ ! $confirm_hosting =~ ^[Yy]$ ]]; then
        print_status $RED "❌ Hosting deployment cancelled by user."
        return 1
    fi
    
    if firebase deploy --only hosting; then
        print_status $GREEN "🎉 Firebase deployment successful!"
        print_status $BLUE "🌐 Your site is live at: https://spandex-salvation-radio-site.web.app"
        print_status $BLUE "🎸 Rock on! Your radio station is live!"
    else
        print_status $RED "❌ Hosting deployment failed!"
        return 1
    fi
}

# Function to handle branch management
manage_branches() {
    print_status $BLUE "🌿 Branch Management..."
    
    current_branch=$(git branch --show-current)
    print_status $CYAN "📍 Current Branch: $current_branch"
    
    echo ""
    print_status $BLUE "🪾 All Branches:"
    git branch -a | grep -v "HEAD" | sed 's/^/  /'
    
    echo ""
    print_status $BLUE "🚀 Choose deployment option:"
    echo "1. Deploy to current branch ($current_branch)"
    echo "2. Deploy to existing branch"
    echo "3. Create new branch and deploy"
    echo "4. Cancel deployment"
    
    read -p "🤔 Enter your choice (1-4): " deployment_choice
    
    case $deployment_choice in
        1)
            target_branch="$current_branch"
            print_status $GREEN "✅ Using current branch: $target_branch"
            ;;
        2)
            echo ""
            read -p "🌿 Enter the branch name or number to deploy to: " target_branch
            
            if [ -z "$target_branch" ]; then
                print_status $RED "❌ Branch name cannot be empty!"
                return 1
            fi
            
            # Convert number to branch name if needed
            if [[ "$target_branch" =~ ^[0-9]+$ ]]; then
                branch_list=($(git branch | sed 's/^[ *]*//'))
                if [ "$target_branch" -le "${#branch_list[@]}" ]; then
                    target_branch="${branch_list[$((target_branch-1))]}"
                    print_status $GREEN "✅ Converted to branch: $target_branch"
                else
                    print_status $RED "❌ Invalid branch number!"
                    return 1
                fi
            fi
            ;;
        3)
            echo ""
            read -p "🌿 Enter name for new branch: " new_branch_name
            
            if [ -z "$new_branch_name" ]; then
                print_status $RED "❌ Branch name cannot be empty!"
                return 1
            fi
            
            # Check if branch already exists
            if git show-ref --verify --quiet refs/heads/$new_branch_name; then
                print_status $RED "❌ Branch '$new_branch_name' already exists!"
                return 1
            fi
            
            target_branch="$new_branch_name"
            print_status $GREEN "✅ Will create and deploy to new branch: $target_branch"
            ;;
        4)
            print_status $RED "❌ Deployment cancelled by user."
            exit 0
            ;;
        *)
            print_status $RED "❌ Invalid choice. Using current branch: $current_branch"
            target_branch="$current_branch"
            ;;
    esac
    
    # Handle branch switching/creation
    if [ "$target_branch" != "$current_branch" ]; then
        if git show-ref --verify --quiet refs/heads/$target_branch; then
            # Switch to existing branch
            print_status $BLUE "🔄 Switching to branch: $target_branch"
            if ! git checkout $target_branch; then
                print_status $RED "❌ Failed to switch to branch: $target_branch"
                return 1
            fi
        else
            # Create and switch to new branch
            print_status $BLUE "🌿 Creating new branch: $target_branch"
            if ! git checkout -b $target_branch; then
                print_status $RED "❌ Failed to create branch: $target_branch"
                return 1
            fi
        fi
        print_status $GREEN "✅ Now on branch: $target_branch"
    fi
}

# Main menu function
show_main_menu() {
    clear
    echo -e "${PURPLE}"
    echo "🎸 SPANDEX SALVATION RADIO - MASTER DEPLOYMENT SCRIPT 🎸"
    echo "======================================================"
    echo -e "${NC}"
    echo ""
    echo "🚀 Choose your deployment strategy:"
    echo ""
    echo "1. 🔄 Prepare GitHub Deployment Package"
    echo "2. 🚀 Deploy to GitHub Repository"
    echo "3. 🔥 Deploy to Firebase (Hosting + Functions)"
    echo "4. 🌿 Manage Git Branches"
    echo "5. 🔧 Fix Common Issues & Check Configuration"
    echo "6. 🚀 FULL AUTOMATED DEPLOYMENT (GitHub + Firebase)"
    echo "7. 📋 Show Current Status"
    echo "8. ❌ Exit"
    echo ""
}

# Function to show current status
show_status() {
    print_status $BLUE "📋 Current Project Status"
    echo "================================"
    
    # Git status
    echo ""
    print_status $CYAN "🌿 Git Status:"
    if [ -d ".git" ]; then
        current_branch=$(git branch --show-current)
        print_status $GREEN "✅ Git repository initialized"
        print_status $CYAN "📍 Current branch: $current_branch"
        
        if git remote get-url origin >/dev/null 2>&1; then
            remote_url=$(git remote get-url origin)
            print_status $GREEN "✅ Remote origin: $remote_url"
        else
            print_status $YELLOW "⚠️  No remote origin configured"
        fi
        
        if ! git diff-index --quiet HEAD --; then
            print_status $YELLOW "⚠️  Uncommitted changes detected"
        else
            print_status $GREEN "✅ Working directory clean"
        fi
    else
        print_status $RED "❌ No Git repository found"
    fi
    
    # Firebase configuration
    echo ""
    print_status $CYAN "🔥 Firebase Configuration:"
    if [ -f "firebase.json" ] && [ -f ".firebaserc" ]; then
        print_status $GREEN "✅ Firebase configuration files present"
        
        # Check hosting target
        if grep -q '"target": "spandex-salvation-radio-site"' firebase.json; then
            print_status $GREEN "✅ Hosting target configured correctly"
        else
            print_status $RED "❌ Hosting target needs update"
        fi
    else
        print_status $RED "❌ Firebase configuration files missing"
    fi
    
    # Deployment package
    echo ""
    print_status $CYAN "📦 Deployment Package:"
    if [ -d "github-deployment-package" ]; then
        print_status $GREEN "✅ GitHub deployment package exists"
        package_size=$(du -sh github-deployment-package | cut -f1)
        print_status $CYAN "📏 Package size: $package_size"
    else
        print_status $YELLOW "⚠️  No deployment package found"
    fi
    
    # Project files
    echo ""
    print_status $CYAN "📁 Project Structure:"
    if [ -d "client" ] && [ -d "server" ] && [ -d "functions" ]; then
        print_status $GREEN "✅ Core project directories present"
    else
        print_status $RED "❌ Missing core project directories"
    fi
    
    echo ""
    print_status $BLUE "Press Enter to continue..."
    read
}

# Main execution
main() {
    check_directory
    
    while true; do
        show_main_menu
        read -p "🤔 Enter your choice (1-8): " choice
        
        case $choice in
            1)
                print_status $BLUE "🔄 Preparing GitHub Deployment Package..."
                create_deployment_package
                print_status $GREEN "✅ Package preparation complete!"
                echo ""
                read -p "Press Enter to continue..."
                ;;
            2)
                if [ ! -d "github-deployment-package" ]; then
                    print_status $YELLOW "⚠️  No deployment package found. Creating one first..."
                    create_deployment_package
                fi
                deploy_to_github
                echo ""
                read -p "Press Enter to continue..."
                ;;
            3)
                print_status $BLUE "🔥 Starting Firebase Deployment..."
                deploy_to_firebase
                echo ""
                read -p "Press Enter to continue..."
                ;;
            4)
                manage_branches
                echo ""
                read -p "Press Enter to continue..."
                ;;
            5)
                print_status $BLUE "🔧 Fixing Common Issues..."
                fix_firebase_config
                check_git_status
                print_status $GREEN "✅ Common issues checked and fixed!"
                echo ""
                read -p "Press Enter to continue..."
                ;;
            6)
                print_status $BLUE "🚀 Starting FULL AUTOMATED DEPLOYMENT..."
                print_status $YELLOW "This will:"
                print_status $YELLOW "1. Fix any configuration issues"
                print_status $YELLOW "2. Create GitHub deployment package"
                print_status $YELLOW "3. Deploy to GitHub"
                print_status $YELLOW "4. Deploy to Firebase"
                echo ""
                read -p "🤔 Continue with full deployment? (y/n): " confirm_full
                
                if [[ $confirm_full =~ ^[Yy]$ ]]; then
                    print_status $BLUE "🔄 Step 1: Fixing configuration issues..."
                    fix_firebase_config
                    check_git_status
                    
                    print_status $BLUE "📦 Step 2: Building client application..."
                    cd client
                    if ! npm run build; then
                        print_status $RED "❌ Client build failed! Cannot proceed with deployment."
                        cd ..
                        continue
                    fi
                    cd ..
                    print_status $GREEN "✅ Client build successful!"
                    
                    print_status $BLUE "📋 Step 3: Creating GitHub deployment package..."
                    create_deployment_package
                    
                    print_status $BLUE "🚀 Step 4: Deploying to GitHub..."
                    if deploy_to_github; then
                        print_status $BLUE "🔥 Step 5: Deploying to Firebase..."
                        deploy_to_firebase
                        print_status $GREEN "🎉 FULL DEPLOYMENT COMPLETE!"
                        print_status $BLUE "🌐 Your site is live at: https://spandex-salvation-radio-site.web.app"
                        print_status $BLUE "📚 Code is deployed to GitHub"
                        print_status $BLUE "🎸 Rock on! Your radio station is fully deployed!"
                    fi
                fi
                echo ""
                read -p "Press Enter to continue..."
                ;;
            7)
                show_status
                ;;
            8)
                print_status $GREEN "👋 Goodbye! Rock on! 🎸"
                exit 0
                ;;
            *)
                print_status $RED "❌ Invalid choice. Please try again."
                echo ""
                read -p "Press Enter to continue..."
                ;;
        esac
    done
}

# Run main function
main
