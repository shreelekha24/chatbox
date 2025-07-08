#!/bin/bash

# ChatBox Deployment Script
echo "🚀 ChatBox Deployment Script"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build check
echo "🔧 Checking build..."
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Check if server is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Server is running successfully!"
else
    echo "❌ Server failed to start"
    kill $SERVER_PID
    exit 1
fi

# Stop the test server
kill $SERVER_PID

echo ""
echo "🎉 ChatBox is ready for deployment!"
echo ""
echo "Choose your deployment option:"
echo ""
echo "1. 🚀 Deploy to Vercel (Recommended)"
echo "   npm install -g vercel"
echo "   vercel"
echo ""
echo "2. 🚂 Deploy to Railway"
echo "   - Go to https://railway.app"
echo "   - Connect your GitHub repository"
echo "   - Railway will auto-deploy"
echo ""
echo "3. 🌐 Deploy to Render"
echo "   - Go to https://render.com"
echo "   - Create new Web Service"
echo "   - Connect your repository"
echo ""
echo "4. 🐳 Deploy with Docker"
echo "   docker build -t chatbox ."
echo "   docker run -p 3000:3000 chatbox"
echo ""
echo "📋 Files created for deployment:"
echo "   ✅ vercel.json - Vercel configuration"
echo "   ✅ railway.json - Railway configuration"
echo "   ✅ render.yaml - Render configuration"
echo "   ✅ public/manifest.json - PWA manifest"
echo "   ✅ public/sw.js - Service worker"
echo "   ✅ WEBSITE-README.md - Deployment guide"
echo ""
echo "🌍 Your website will be available at:"
echo "   - Vercel: https://your-app-name.vercel.app"
echo "   - Railway: https://your-app-name.railway.app"
echo "   - Render: https://your-app-name.onrender.com"
echo ""
echo "📱 PWA Features Enabled:"
echo "   ✅ Installable as mobile app"
echo "   ✅ Offline functionality"
echo "   ✅ Push notifications"
echo "   ✅ App-like experience"
echo ""
echo "🔗 Share your website with:"
echo "   https://your-domain.com/room/ROOM_ID"
echo ""
echo "Happy deploying! 🎊" 