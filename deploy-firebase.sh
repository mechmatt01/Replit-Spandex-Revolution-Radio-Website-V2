#!/bin/bash

# Firebase deployment script for Spandex Salvation Radio
# Deploy to https://www.spandex-salvation-radio.com/
# Deploy to custom domain https://www.spandex-salvation-radio.com/

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

# Ask for target branch
echo ""
read -p "🌿 Enter the branch name or number to commit to (e.g., main) or (1) or press Enter for current branch: " target_branch

# If no input provided, default to current branch
if [ -z "$target_branch" ]; then
    target_branch="$current_branch"
    echo "✅ Using current branch: $target_branch"
fi

# Validate branch input
if [ -z "$target_branch" ]; then
    echo "❌ Branch name cannot be empty!"
    exit 1
fi

# Check if input is a number and convert to branch name if needed
if [[ "$target_branch" =~ ^[0-9]+$ ]]; then
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

# Check if target branch exists, if not ask to create it
if ! git show-ref --verify --quiet refs/heads/$target_branch; then
    echo "⚠️  Branch '$target_branch' doesn't exist."
    read -p "🤔 Would you like to create it? (y/n): " create_branch
    if [[ $create_branch =~ ^[Yy]$ ]]; then
        echo "🌿 Creating new branch: $target_branch"
        git checkout -b $target_branch
    else
        echo "❌ Deployment cancelled. Please create the branch manually or choose an existing one."
        exit 1
    fi
else
    # Switch to target branch
    echo "🔄 Switching to branch: $target_branch"
    git checkout $target_branch
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "📋 You have uncommitted changes. Let's commit them!"
    
    # Add all changes
    echo "➕ Adding all changes..."
    git add .
    
    # Ask for commit message
    echo ""
    read -p "💬 Enter your commit message or press Enter for default: " commit_message
    
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
read -p "🚀 Push changes to remote repository? (y/n): " push_changes
if [[ $push_changes =~ ^[Yy]$ ]]; then
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

# Build the client
echo "📦 Building client application..."

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
firebase deploy --only functions

if [ $? -ne 0 ]; then
    echo "❌ Functions deployment failed!"
    exit 1
fi

echo "✅ Functions deployment successful!"

# Deploy to Firebase Hosting
echo "🚀 Deploying to Firebase Hosting..."
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