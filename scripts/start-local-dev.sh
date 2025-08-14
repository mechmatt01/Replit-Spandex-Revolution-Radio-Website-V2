#!/bin/bash

# Deploy to the Local Dev Server
# Run this command from the root project directory

# ./scripts/start-local-dev.sh

# Local Development Script for Spandex Salvation Radio
# Kills all ports, rebuilds, and launches full stack with browser preview

# Links to the Local Dev Server: 
# http://localhost:3000 (Client)
# http://localhost:4000 (Server)


echo "🚀 Starting Local Development Environment..."
echo "=========================================="

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pids" ]; then
        echo "🔄 Killing processes on port $port..."
        echo "$pids" | xargs kill -9 2>/dev/null
        echo "✅ Port $port cleared"
    else
        echo "✅ Port $port already free"
    fi
}

# Function to kill all node processes
kill_node_processes() {
    echo "🔄 Killing all Node.js processes..."
    pkill -f "node" 2>/dev/null
    pkill -f "npm" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    echo "✅ All Node processes killed"
}

# Function to find available port
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
    echo "🛑 Shutting down local development environment..."
    kill_node_processes
    
    # Kill specific ports
    kill_port 3000
    kill_port 3001
    kill_port 4000
    kill_port 5000
    kill_port 8000
    kill_port 8080
    
    echo "✅ Cleanup complete. Goodbye! 👋"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Step 1: Kill all existing processes and ports
echo "🧹 Step 1: Cleaning up existing processes..."
echo "--------------------------------------------"
echo "⚠️  This will kill all Node.js processes and clear ports."
read -p "🤔 Continue with cleanup? (y/n/cancel): " confirm_cleanup

if [ "$confirm_cleanup" = "cancel" ]; then
    echo "❌ Cleanup cancelled by user. Exiting safely."
    exit 0
elif [[ ! $confirm_cleanup =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled by user. Exiting safely."
    exit 0
fi

kill_node_processes

# Kill common development ports
echo "🔄 Clearing common development ports..."
kill_port 3000
kill_port 3001
kill_port 4000
kill_port 5000
kill_port 8000
kill_port 8080

echo "✅ Cleanup complete!"
echo ""

# Step 2: Rebuild everything
echo "🔨 Step 2: Rebuilding applications..."
echo "------------------------------------"
echo "⚠️  This will install dependencies and rebuild applications."
read -p "🤔 Continue with rebuild? (y/n/cancel): " confirm_rebuild

if [ "$confirm_rebuild" = "cancel" ]; then
    echo "❌ Rebuild cancelled by user. Cleanup completed."
    exit 0
elif [[ ! $confirm_rebuild =~ ^[Yy]$ ]]; then
    echo "❌ Rebuild cancelled by user. Cleanup completed."
    exit 0
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# Build client
echo "🏗️  Building client application..."
cd client
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Client build failed!"
    exit 1
fi
cd ..
echo "✅ Client build successful!"

# Build server (this project uses tsx for dev, tsc for production)
echo "🏗️  Building server application..."
npm run build:server
if [ $? -ne 0 ]; then
    echo "❌ Server build failed!"
    exit 1
fi
echo "✅ Server build successful!"

echo ""

# Step 3: Find available ports and launch
echo "🚀 Step 3: Launching applications..."
echo "------------------------------------"

# This project uses fixed ports: Client on 3000, Server on 4000
CLIENT_PORT=3000
SERVER_PORT=4000

echo "📍 Client will run on port: $CLIENT_PORT"
echo "📍 Server will run on port: $SERVER_PORT"

# Launch server in background (this project uses tsx for development)
echo "🖥️  Starting server..."
npm run dev &
SERVER_PID=$!

# Wait a moment for server to start
sleep 2

# Launch client in background
echo "🌐 Starting client..."
cd client
npm run dev &
CLIENT_PID=$!
cd ..

# Wait for client to start
sleep 3

# Check if both are running
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Server failed to start!"
    exit 1
fi

if ! kill -0 $CLIENT_PID 2>/dev/null; then
    echo "❌ Client failed to start!"
    exit 1
fi

echo "✅ Both applications are running!"
echo ""

# Step 4: Display links and wait for quit command
echo "🌍 Your local development environment is ready!"
echo "=============================================="
echo "🖥️  Server: http://localhost:$SERVER_PORT"
echo "🌐 Client: http://localhost:$CLIENT_PORT"
echo ""

# Open browser to client
echo "🌐 Opening browser to client..."
open "http://localhost:$CLIENT_PORT" 2>/dev/null || xdg-open "http://localhost:$CLIENT_PORT" 2>/dev/null || echo "Please manually open: http://localhost:$CLIENT_PORT"

echo ""
echo "💡 Type 'quit', 'Quit', or 'q' and press Enter to stop everything"
echo "=================================================================="

# Wait for quit command
while true; do
    read -p "> " command
    case $command in
        [Qq]uit|[Qq])
            echo "🛑 Quit command received..."
            break
            ;;
        *)
            echo "💡 Type 'quit', 'Quit', or 'q' to stop"
            ;;
    esac
done

# Cleanup will happen automatically via trap
