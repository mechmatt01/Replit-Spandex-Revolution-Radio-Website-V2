#!/bin/bash

echo "🚀 Fixing deployment issues..."

# Step 1: Fix the vite.config import in production build
echo "Fixing vite.config import..."
sed -i 's/import("..\/vite\.config")/import("..\/vite.config.js")/g' dist/index.js

# Step 2: Add conditional dotenv loading
echo "Adding conditional dotenv loading..."
sed -i 's/import "dotenv\/config";/try { await import("dotenv\/config"); } catch (e) { console.log("dotenv not available"); }/g' dist/index.js

# Step 3: Ensure server binds to 0.0.0.0 for Replit
echo "Ensuring proper host binding..."
grep -q "0.0.0.0" dist/index.js && echo "✅ Host binding already correct" || echo "⚠️  Host binding may need manual check"

# Step 4: Create a deployment-ready package.json in dist/
echo "Creating production package.json..."
cat > dist/package.json << 'EOF'
{
  "name": "spandex-salvation-radio",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Step 5: Create a production Dockerfile if needed
echo "Creating production Dockerfile..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy built application
COPY dist/ ./
COPY client/dist/ ./client/dist/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]
EOF

echo "✅ Deployment fixes applied!"
echo ""
echo "To deploy:"
echo "1. Make sure all environment variables are set in your deployment environment"
echo "2. Run: NODE_ENV=production node dist/index.js"
echo "3. The server will listen on 0.0.0.0:5000"
echo ""
echo "Required environment variables:"
echo "- DATABASE_URL"
echo "- And any other API keys your app uses"