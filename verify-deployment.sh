#!/bin/bash

# Spandex Salvation Radio - Pre-Deployment Verification Script
# This script verifies the project is ready for Firebase Hosting deployment

set -e

echo "🔍 Starting pre-deployment verification..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

# 1. Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$NODE_MAJOR" -ge 18 ]; then
    echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION (required: 18+)"
else
    echo -e "${RED}✗${NC} Node.js $NODE_VERSION (required: 18+)"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# 2. Check Firebase CLI
echo "🔥 Checking Firebase CLI..."
if command -v firebase &> /dev/null; then
    FIREBASE_VERSION=$(firebase --version)
    echo -e "${GREEN}✓${NC} Firebase CLI installed: $FIREBASE_VERSION"
else
    echo -e "${RED}✗${NC} Firebase CLI not installed"
    echo "  Run: npm install -g firebase-tools"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# 3. Check project structure
echo "📁 Checking project structure..."
REQUIRED_DIRS=(
    "client"
    "server"
    "shared"
    "functions"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} Directory: $dir/"
    else
        echo -e "${RED}✗${NC} Missing directory: $dir/"
        FAILURES=$((FAILURES + 1))
    fi
done
echo ""

# 4. Check required files
echo "📄 Checking required files..."
REQUIRED_FILES=(
    "firebase.json"
    ".firebaserc"
    "package.json"
    "client/package.json"
    "client/vite.config.ts"
    "client/src/main.tsx"
    "client/src/firebase.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} File: $file"
    else
        echo -e "${RED}✗${NC} Missing file: $file"
        FAILURES=$((FAILURES + 1))
    fi
done
echo ""

# 5. Check Firebase project configuration
echo "⚙️  Checking Firebase project configuration..."
if [ -f ".firebaserc" ]; then
    PROJECT=$(grep -o '"default"[^,}]*' .firebaserc | head -1 | grep -o '"[^"]*"' | tail -1 | tr -d '"')
    if [ "$PROJECT" = "spandex-salvation-radio-site" ]; then
        echo -e "${GREEN}✓${NC} Firebase project: $PROJECT"
    else
        echo -e "${YELLOW}⚠${NC} Firebase project: $PROJECT (expected: spandex-salvation-radio-site)"
    fi
else
    echo -e "${RED}✗${NC} Missing .firebaserc"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# 6. Check environment variables
echo "🔐 Checking environment variables..."
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠${NC} No .env.local file found"
    echo "  Copy .env.example to .env.local and fill in Firebase credentials"
    FAILURES=$((FAILURES + 1))
else
    if grep -q "VITE_FIREBASE_PROJECT_ID" .env.local; then
        echo -e "${GREEN}✓${NC} Firebase environment variables configured"
    else
        echo -e "${RED}✗${NC} Missing Firebase environment variables in .env.local"
        FAILURES=$((FAILURES + 1))
    fi
fi
echo ""

# 7. Check build directory
echo "🏗️  Checking client build..."
if [ -d "client/dist" ]; then
    INDEX_HTML=$(find client/dist -name "index.html" -type f)
    if [ -n "$INDEX_HTML" ]; then
        echo -e "${GREEN}✓${NC} Build output found: client/dist/"
        echo "  index.html exists"
    else
        echo -e "${YELLOW}⚠${NC} Build output exists but missing index.html"
    fi
else
    echo -e "${YELLOW}⚠${NC} Build directory not found (run 'npm run build' first)"
fi
echo ""

# 8. Check vite config
echo "⚡ Checking Vite configuration..."
if [ -f "client/vite.config.ts" ]; then
    if grep -q "outDir.*dist" client/vite.config.ts; then
        echo -e "${GREEN}✓${NC} Vite output directory configured: dist/"
    else
        echo -e "${RED}✗${NC} Vite output directory not properly configured"
        FAILURES=$((FAILURES + 1))
    fi
else
    echo -e "${RED}✗${NC} Missing client/vite.config.ts"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# 9. Check firebase.json configuration
echo "📋 Checking firebase.json configuration..."
if [ -f "firebase.json" ]; then
    if grep -q '"public": "client/dist"' firebase.json; then
        echo -e "${GREEN}✓${NC} Firebase public directory: client/dist"
    else
        echo -e "${RED}✗${NC} Firebase public directory not set to client/dist"
        FAILURES=$((FAILURES + 1))
    fi
    
    if grep -q '"destination": "/index.html"' firebase.json; then
        echo -e "${GREEN}✓${NC} SPA rewrite rule configured"
    else
        echo -e "${YELLOW}⚠${NC} SPA rewrite rule not found (routes may not work)"
    fi
else
    echo -e "${RED}✗${NC} Missing firebase.json"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# 10. Check Firebase authentication
echo "🔑 Checking Firebase authentication..."
if firebase auth:list > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Firebase authenticated"
else
    echo -e "${YELLOW}⚠${NC} Firebase not authenticated"
    echo "  Run: firebase login"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready for deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. npm run build          # Build the application"
    echo "  2. firebase deploy        # Deploy to Firebase Hosting"
    exit 0
else
    echo -e "${RED}✗ $FAILURES check(s) failed. Please fix the issues above.${NC}"
    exit 1
fi
