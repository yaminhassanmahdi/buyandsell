#!/bin/bash

echo "🚀 Deploying Buy and Sell to Vercel"
echo "==================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel first:"
    vercel login
    exit 1
fi

echo "✅ Vercel CLI is ready"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel

echo ""
echo "📋 After deployment, set these environment variables in your Vercel dashboard:"
echo ""
echo "DB_HOST=13.203.104.73"
echo "DB_USER=2ndhandbajar_com"
echo "DB_PASSWORD=2ndhandbajar_com"
echo "DB_NAME=2ndhandbajar_com"
echo "DB_PORT=3306"
echo "NODE_ENV=production"
echo "NEXT_PUBLIC_APP_NAME=Buy and Sell"
echo "NEXT_PUBLIC_APP_URL=https://your-app.vercel.app"
echo "JWT_SECRET=your-super-secure-jwt-secret-key-change-this-immediately"
echo "NEXTAUTH_SECRET=your-super-secure-nextauth-secret-change-this-immediately"
echo "NEXTAUTH_URL=https://your-app.vercel.app"
echo "DB_CONNECTION_LIMIT=10"
echo "DB_QUEUE_LIMIT=0"
echo "DEFAULT_CURRENCY=BDT"
echo "DEFAULT_CURRENCY_SYMBOL=৳"
echo "NEXT_PUBLIC_IMAGE_DOMAINS=images.unsplash.com,placehold.co,2ndhandbajar.com"
echo "DEBUG=false"
echo ""
echo "📖 For detailed instructions, see VERCEL_DEPLOYMENT_STEPS.md" 