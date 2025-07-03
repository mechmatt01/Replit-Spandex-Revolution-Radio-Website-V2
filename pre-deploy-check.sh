
#!/bin/bash

echo "🚀 Pre-deployment verification starting..."

# Check Node.js version
echo "📋 Checking Node.js version..."
node --version

# Check npm version  
echo "📋 Checking npm version..."
npm --version

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd client && npm install && cd ..

# Check for asset files
echo "📁 Verifying asset files..."
MISSING_ASSETS=0
for asset in "CountriesIcon.png" "GoogleLogoIcon.png" "IconPackageIcon.png" "LegendPackageIcon.png" "LiveNowIcon.png" "MusicLogoIcon@3x.png" "RebelPackageIcon.png"; do
  if [ ! -f "attached_assets/$asset" ]; then
    echo "❌ Missing asset: $asset"
    MISSING_ASSETS=$((MISSING_ASSETS + 1))
  else
    echo "✅ Found asset: $asset"
  fi
done

# Check for problematic imports
echo "🔍 Checking for problematic asset imports..."
PROBLEM_IMPORTS=$(grep -r "_[0-9]\+\.png" client/src/ --include="*.tsx" --include="*.ts" | wc -l)
if [ $PROBLEM_IMPORTS -gt 0 ]; then
  echo "❌ Found $PROBLEM_IMPORTS problematic asset imports"
  grep -r "_[0-9]\+\.png" client/src/ --include="*.tsx" --include="*.ts"
else
  echo "✅ No problematic asset imports found"
fi

# Test build
echo "🏗️  Testing build..."
npm run build
BUILD_STATUS=$?

if [ $BUILD_STATUS -eq 0 ]; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed!"
  exit 1
fi

# Final summary
echo ""
echo "📊 Pre-deployment summary:"
if [ $MISSING_ASSETS -eq 0 ] && [ $PROBLEM_IMPORTS -eq 0 ] && [ $BUILD_STATUS -eq 0 ]; then
  echo "🎉 All checks passed! Ready for deployment."
  exit 0
else
  echo "⚠️  Issues found that need resolution before deployment."
  exit 1
fi
