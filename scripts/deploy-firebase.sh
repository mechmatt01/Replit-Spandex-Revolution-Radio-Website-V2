#!/bin/bash

# Firebase deployment script for Spandex Salvation Radio
# Deploy to https://www.spandex-salvation-radio.com/
# Firebase Console: https://console.firebase.google.com/project/spandex-salvation-radio-site/overview
# GitHub Repo: https://github.com/spandex-salvation-radio/spandex-salvation-radio-site

# Deploy to the GitHub Repo and Firebase Hosting
# Run this command from the root project directory
# ./scripts/deploy-firebase.sh

echo "🔥 Starting Firebase deployment for Spandex Salvation Radio..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Git operations
echo "📝 Git Operations..."
echo "=================="

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository! Please run this from your project root."
    exit 1
fi

# Get current branch
current_branch=$(git branch --show-current)
echo "📍  Current Branch: $current_branch"

# Show all available branches with numbering
echo ""
# Get main branch first (if it exists), then other branches
main_branch=$(git branch --format='%(refname:short)' | grep -E '^main$' | head -1)
other_branches=$(git branch --format='%(refname:short)' | grep -v '^main$' | sort)

# Count total branches
total_branches=0
if [ -n "$main_branch" ]; then
    total_branches=$((total_branches + 1))
fi
if [ -n "$other_branches" ]; then
    total_branches=$((total_branches + $(echo "$other_branches" | wc -l)))
fi

echo "🪾 All Branches (1 - $total_branches):"

# Display numbered branches
branch_number=1
if [ -n "$main_branch" ]; then
    echo "$branch_number. $main_branch"
    branch_number=$((branch_number + 1))
fi
if [ -n "$other_branches" ]; then
    while IFS= read -r branch; do
        if [ -n "$branch" ]; then
            echo "$branch_number. $branch"
            branch_number=$((branch_number + 1))
        fi
    done <<< "$other_branches"
fi

# Ask for deployment option
echo ""
echo "🚀 Choose deployment option:"
echo "1. Deploy to current branch ($current_branch)"
echo "2. Deploy to existing branch"
echo "3. Create new branch and deploy"
echo "4. Cancel deployment"
read -p "🤔 Enter your choice (1-4): " deployment_choice

case $deployment_choice in
    1)
        target_branch="$current_branch"
        echo "✅ Using current branch: $target_branch"
        ;;
    2)
        echo ""
        read -p "🌿 Enter the branch name or number to deploy to: " target_branch
        
        # Validate branch input
        if [ -z "$target_branch" ]; then
            echo "❌ Branch name cannot be empty!"
            exit 1
        fi
        ;;
    3)
        echo ""
        read -p "🌿 Enter name for new branch: " new_branch_name
        
        # Validate new branch name
        if [ -z "$new_branch_name" ]; then
            echo "❌ Branch name cannot be empty!"
            exit 1
        fi
        
        # Check if branch already exists
        if git show-ref --verify --quiet refs/heads/$new_branch_name; then
            echo "❌ Branch '$new_branch_name' already exists!"
            exit 1
        fi
        
        target_branch="$new_branch_name"
        echo "✅ Will create and deploy to new branch: $target_branch"
        ;;
    4)
        echo "❌ Deployment cancelled by user."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Using current branch: $current_branch"
        target_branch="$current_branch"
        ;;
esac

# Check if input is a number and convert to branch name if needed (only for option 2)
if [ "$deployment_choice" = "2" ] && [[ "$target_branch" =~ ^[0-9]+$ ]]; then
    # Convert number to branch name
    branch_number=1
    selected_branch=""
    
    if [ -n "$main_branch" ]; then
        if [ "$target_branch" -eq "$branch_number" ]; then
            selected_branch="$main_branch"
        fi
        branch_number=$((branch_number + 1))
    fi
    
    if [ -z "$selected_branch" ] && [ -n "$other_branches" ]; then
        while IFS= read -r branch; do
            if [ -n "$branch" ]; then
                if [ "$target_branch" -eq "$branch_number" ]; then
                    selected_branch="$branch"
                    break
                fi
                branch_number=$((branch_number + 1))
            fi
        done <<< "$other_branches"
    fi
    
    if [ -n "$selected_branch" ]; then
        echo "✅ Selected branch: $selected_branch"
        target_branch="$selected_branch"
    else
        echo "❌ Invalid branch number: $target_branch"
        exit 1
    fi
fi

# Handle branch creation and switching
if [ "$deployment_choice" = "3" ]; then
    # Create new branch
    echo "🌿 Creating new branch: $target_branch"
    git checkout -b $target_branch
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create branch: $target_branch"
        exit 1
    fi
    echo "✅ New branch created and switched to: $target_branch"
elif ! git show-ref --verify --quiet refs/heads/$target_branch; then
    echo "⚠️  Branch '$target_branch' doesn't exist."
    read -p "🤔 Would you like to create it? (y/n): " create_branch
    if [[ $create_branch =~ ^[Yy]$ ]]; then
        echo "🌿 Creating new branch: $target_branch"
        git checkout -b $target_branch
        if [ $? -ne 0 ]; then
            echo "❌ Failed to create branch: $target_branch"
            exit 1
        fi
    else
        echo "❌ Deployment cancelled. Please create the branch manually or choose an existing one."
        exit 1
    fi
else
    # Switch to existing branch
    echo "🔄 Switching to branch: $target_branch"
    git checkout $target_branch
    if [ $? -ne 0 ]; then
        echo "❌ Failed to switch to branch: $target_branch"
        exit 1
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "📋 You have uncommitted changes. Let's commit them!"
    
    # Add all changes
    echo "➕ Adding all changes..."
    git add .
    
    # Ask for commit message
    echo ""
    read -p "💬 Enter your commit message or press Enter for default (or type 'cancel' to abort): " commit_message
    
    # Check for cancel
    if [ "$commit_message" = "cancel" ]; then
        echo "❌ Deployment cancelled by user. Changes are still staged but not committed."
        git reset HEAD
        exit 0
    fi
    
    # If no input provided, use default message
    if [ -z "$commit_message" ]; then
        commit_message="Deploy to Firebase - $(date '+%Y-%m-%d %H:%M:%S')"
        echo "✅ Using default commit message: $commit_message"
    fi
    
    # Validate commit message
    if [ -z "$commit_message" ]; then
        echo "❌ Commit message cannot be empty!"
        exit 1
    fi
    
    # Commit changes
    echo "💾 Committing changes..."
    git commit -m "$commit_message"
    
    if [ $? -eq 0 ]; then
        echo "✅ Commit successful!"
    else
        echo "❌ Commit failed!"
        exit 1
    fi
else
    echo "✅ No uncommitted changes found."
fi

# Push to remote (optional)
echo ""
read -p "🚀 Push changes to remote repository? (y/n/cancel): " push_changes
if [ "$push_changes" = "cancel" ]; then
    echo "❌ Deployment cancelled by user. Changes are committed locally but not pushed."
    exit 0
elif [[ $push_changes =~ ^[Yy]$ ]]; then
    echo "📤 Pushing to remote..."
    git push origin $target_branch
    
    if [ $? -eq 0 ]; then
        echo "✅ Push successful!"
    else
        echo "❌ Push failed! Continuing with deployment anyway..."
    fi
fi

echo ""
echo "🚀 Starting Firebase Deployment..."
echo "================================"
echo "⚠️  This will deploy to Firebase Hosting and Functions."
read -p "🤔 Continue with Firebase deployment? (y/n/cancel): " continue_deploy

if [ "$continue_deploy" = "cancel" ]; then
    echo "❌ Deployment cancelled by user. Git changes are preserved."
    exit 0
elif [[ ! $continue_deploy =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled by user. Git changes are preserved."
    exit 0
fi

# Build the client
echo "📦 Building client application..."
read -p "🤔 Continue with client build? (y/n/cancel): " continue_build

if [ "$continue_build" = "cancel" ]; then
    echo "❌ Build cancelled by user. Git changes are preserved."
    exit 0
elif [[ ! $continue_build =~ ^[Yy]$ ]]; then
    echo "❌ Build cancelled by user. Git changes are preserved."
    exit 0
fi

cd client
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Client build failed!"
    exit 1
fi

echo "✅ Client build successful!"

# Return to root directory
cd ..

# Login to Firebase (if not already logged in)
echo "🔐 Checking Firebase authentication..."
firebase login --interactive

# Deploy Firebase Functions first
echo "⚡ Deploying Firebase Functions..."
read -p "🤔 Continue with Firebase Functions deployment? (y/n/cancel): " continue_functions

if [ "$continue_functions" = "cancel" ]; then
    echo "❌ Functions deployment cancelled by user. Client build completed."
    exit 0
elif [[ ! $continue_functions =~ ^[Yy]$ ]]; then
    echo "❌ Functions deployment cancelled by user. Client build completed."
    exit 0
fi

firebase deploy --only functions

if [ $? -ne 0 ]; then
    echo "❌ Functions deployment failed!"
    exit 1
fi

echo "✅ Functions deployment successful!"

# Deploy to Firebase Hosting
echo "🚀 Deploying to Firebase Hosting..."
read -p "🤔 Continue with Firebase Hosting deployment? (y/n/cancel): " continue_hosting

if [ "$continue_hosting" = "cancel" ]; then
    echo "❌ Hosting deployment cancelled by user. Functions deployed successfully."
    exit 0
elif [[ ! $continue_hosting =~ ^[Yy]$ ]]; then
    echo "❌ Hosting deployment cancelled by user. Functions deployed successfully."
    exit 0
fi

firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🎥 Your site is now live at: https://spandex-salvation-radio-site.web.app"
    echo "🌐 Custom domain: https://www.spandex-salvation-radio.com/"
    echo "🌤️ Weather API is now available at: /api/weather"
    echo "📝 Changes committed to branch: $target_branch"
else
    echo "❌ Hosting deployment failed!"
    exit 1
fi

echo "🎸 Rock on! Your radio station site changes are live! 🎸"