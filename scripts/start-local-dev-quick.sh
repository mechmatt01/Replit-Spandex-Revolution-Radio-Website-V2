#!/bin/bash

# Quick Local Development Script for Spandex Salvation Radio
# Optimized for speed - kills processes, quick rebuilds, and launches stack

# Run this command from the root project directory

# cd /path/to/spandex-salvation-radio-site
# ./scripts/start-local-dev-quick.sh

# Links to the Local Dev Server: 
# http://localhost:3000 (Client)
# http://localhost:4000 (Server)


echo "⚡ Quick Local Dev Launch - Spandex Salvation Radio"
echo "=================================================="

# Function to kill processes on specific ports (optimized)
kill_port() {
    local port=$1
    lsof -ti:$port 2>/dev/null | xargs kill -9 2>/dev/null && echo "✅ Port $port cleared" || echo "✅ Port $port already free"
}

# Function to kill all node processes (optimized)
kill_node_processes() {
    echo "🔄 Killing Node processes..."
    pkill -f "node" 2>/dev/null
    pkill -f "npm" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    echo "✅ Node processes cleared"
}

# Function to find available port (optimized)
find_available_port() {
    local port=3000
    while lsof -ti:$port >/dev/null 2>&1; do
        port=$((port + 1))
    done
    echo $port
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill_node_processes
    kill_port 3000
    kill_port 3001
    kill_port 4000
    kill_port 5000
    kill_port 8000
    kill_port 8080
    echo "✅ Cleanup complete! 👋"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Step 1: Quick cleanup
echo "🧹 Quick cleanup..."
kill_node_processes
kill_port 3000
kill_port 3001
kill_port 4000
kill_port 5000
kill_port 8000
kill_port 8080
echo "✅ Cleanup done!"
echo ""

# Step 2: Quick dependency check and install (skip if already installed)
echo "📦 Quick dependency check..."
if [ ! -d "node_modules" ] || [ ! -d "client/node_modules" ] || [ ! -d "server/node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
    cd client && npm install && cd ..
    cd server && npm install && cd ..
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi
echo ""

# Step 3: Quick rebuilds (only if needed)
echo "🔨 Quick rebuilds..."

# Check if client needs rebuild (compare timestamps)
if [ ! -d "client/dist" ] || [ "client/src" -nt "client/dist" ] || [ "client/package.json" -nt "client/dist" ]; then
    echo "🏗️  Building client..."
    cd ..
    cd client
    npm run build || { echo "❌ Client build failed!"; exit 1; }
    cd ..
    echo "✅ Client built"
else
    echo "✅ Client build not needed"
fi

# Check if server needs rebuild (this project uses tsx for dev, tsc for production)
if [ ! -d "dist" ] || [ "server" -nt "dist" ] || [ "package.json" -nt "dist" ]; then
    echo "🏗️  Building server..."
    npm run build:server || { echo "❌ Server build failed!"; exit 1; }
    echo "✅ Server built"
else
    echo "✅ Server build not needed"
fi
echo ""

# Step 4: Launch applications with configured ports
echo "🚀 Launching applications..."

# This project uses fixed ports: Client on 3000, Server on 4000
CLIENT_PORT=3000
SERVER_PORT=4000

echo "📍 Client: $CLIENT_PORT | Server: $SERVER_PORT"

# Launch server (this project uses tsx for development)
echo "🖥️  Starting server..."
npm run dev > server.log 2>&1 &
SERVER_PID=$!

# Quick wait and check
sleep 1
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Server failed to start! Check server.log for details"
    cat server/server.log 2>/dev/null || echo "No server log found"
    exit 1
fi
echo "✅ Server started"

# Launch client
echo "🌐 Starting client..."
cd client
npm run dev > client.log 2>&1 &
CLIENT_PID=$!
cd ..

# Quick wait and check
sleep 2
if ! kill -0 $CLIENT_PID 2>/dev/null; then
    echo "❌ Client failed to start! Check client.log for details"
    cat client/client.log 2>/dev/null || echo "No client log found"
    exit 1
fi
echo "✅ Client started"
echo ""

# Step 5: Display status and links
echo "🌍 Quick dev environment ready!"
echo "==============================="
echo "🖥️  Server: http://localhost:$SERVER_PORT"
echo "🌐 Client: http://localhost:$CLIENT_PORT"
echo ""

# Open browser (optional)
if command -v open >/dev/null 2>&1; then
    open "http://localhost:$CLIENT_PORT" 2>/dev/null
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:$CLIENT_PORT" 2>/dev/null
fi

echo "💡 Type 'q', 'Q', 'quit', or 'Quit' to stop everything"
echo "========================================================"

# Wait for quit command
while true; do
    read -p "> " command
    case $command in
        [Qq]uit|[Qq])
            echo "🛑 Stopping..."
            break
            ;;
        *)
            echo "💡 Type 'q', 'Q', 'quit', or 'Quit' to stop"
            ;;
    esac
done

# Cleanup happens automatically via trap
