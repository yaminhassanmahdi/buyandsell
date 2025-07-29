#!/bin/bash

# Vercel Deployment Script for Buy and Sell
# This script helps prepare and deploy the application to Vercel

echo "🚀 Buy and Sell - Vercel Deployment Script"
echo "=========================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please login first:"
    vercel login
    exit 1
fi

echo "✅ Vercel CLI is ready"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating template..."
    cat > .env.local << EOF
# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=3306

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=Buy and Sell
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
JWT_SECRET=your-jwt-secret-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Connection Pool Settings
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0
EOF
    echo "📝 Created .env.local template. Please update with your values."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo "Choose deployment option:"
echo "1. Deploy to preview (recommended for testing)"
echo "2. Deploy to production"
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        echo "📋 Deploying to preview..."
        vercel
        ;;
    2)
        echo "🚀 Deploying to production..."
        vercel --prod
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your production database"
echo "2. Configure environment variables in Vercel dashboard"
echo "3. Update domain settings if needed"
echo "4. Test your application"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md" 