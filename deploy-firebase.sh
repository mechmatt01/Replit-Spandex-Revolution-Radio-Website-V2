#!/bin/bash

# Firebase deployment script for Spandex Salvation Radio
# Deploy to https://www.spandex-salvation-radio.com/

echo "🔥 Starting Firebase deployment for Spandex Salvation Radio..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

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

# Deploy to Firebase Hosting
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your site is now live at: https://spandex-salvation-radio-site.web.app"
    echo "🌐 Custom domain: https://www.spandex-salvation-radio.com/"
else
    echo "❌ Deployment failed!"
    exit 1
fi

echo "🎸 Rock on! Your radio station is live! 🎸"