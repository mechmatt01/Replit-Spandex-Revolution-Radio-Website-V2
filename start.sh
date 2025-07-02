#!/bin/bash
# Replit deployment startup script

echo "🚀 Starting Spandex Salvation Radio..."
echo "Environment: $NODE_ENV"
echo "Port: $PORT"
echo "Host: $HOST"

# Ensure dependencies are available
echo "Checking dependencies..."
node -e "
try {
  require('express');
  console.log('✅ Express available');
} catch (e) {
  console.log('❌ Express not available:', e.message);
}
"

# Start the application
exec node dist/index.js
