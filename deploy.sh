#!/bin/bash
# Quick Deployment Scripts for Pharmacy Inventory System (Linux/Mac)
# اسکریپت انتشار سریع سیستم مدیریت انبار دارو

PROJECT_NAME="pharmacy-inventory-system"
BUILD_COMMAND="npm run build"

echo "🚀 Starting deployment process for $PROJECT_NAME..."

# Check if project has been built
if [ ! -d "dist" ]; then
    echo "📦 Building project..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed!"
        exit 1
    fi
    echo "✅ Build completed successfully!"
else
    echo "✅ Build directory exists"
fi

# Check environment variables
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Using .env.example as template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your Supabase credentials before deployment!"
    echo "   - VITE_SUPABASE_URL=your-supabase-url"
    echo "   - VITE_SUPABASE_ANON_KEY=your-anon-key"
    read -p "Press Enter after updating .env file..."
fi

# Deploy options
if command -v vercel &> /dev/null; then
    echo "🌐 Deploying to Vercel..."
    vercel --prod
    echo "✅ Deployed to Vercel!"
elif command -v netlify &> /dev/null; then
    echo "🌐 Deploying to Netlify..."
    netlify deploy --prod --dir=dist
    echo "✅ Deployed to Netlify!"
else
    echo "📋 No CLI tools found. Manual deployment options:"
    echo "1. Install Vercel CLI: npm install -g vercel"
    echo "2. Install Netlify CLI: npm install -g netlify-cli"
    echo "3. Or deploy via GitHub: https://vercel.com/import"
    echo "4. Or use Netlify: drag and drop 'dist' folder to https://netlify.com/drop"
fi

echo "🎉 Deployment process completed!"
echo "📖 For detailed instructions, see: COMPLETE_DEPLOYMENT_GUIDE.md"
