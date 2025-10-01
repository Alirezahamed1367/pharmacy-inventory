# Quick Deployment Scripts for Pharmacy Inventory System
# اسکریپت‌های انتشار سریع سیستم مدیریت انبار دارو

# Quick Vercel Deployment
$projectName = "pharmacy-inventory-system"
$buildCommand = "npm run build"

Write-Host "🚀 Starting deployment process for $projectName..." -ForegroundColor Green

# Check if project has been built
if (!(Test-Path "dist")) {
    Write-Host "📦 Building project..." -ForegroundColor Yellow
    & npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
} else {
    Write-Host "✅ Build directory exists" -ForegroundColor Green
}

# Check environment variables
if (!(Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Using .env.example as template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Please edit .env file with your Supabase credentials before deployment!" -ForegroundColor Yellow
    Write-Host "   - VITE_SUPABASE_URL=your-supabase-url" -ForegroundColor Cyan
    Write-Host "   - VITE_SUPABASE_ANON_KEY=your-anon-key" -ForegroundColor Cyan
    Read-Host "Press Enter after updating .env file..."
}

# Deploy to Vercel (if Vercel CLI is installed)
if (Get-Command "vercel" -ErrorAction SilentlyContinue) {
    Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Blue
    & vercel --prod
    Write-Host "✅ Deployed to Vercel!" -ForegroundColor Green
} else {
    Write-Host "📋 Vercel CLI not found. Manual deployment options:" -ForegroundColor Yellow
    Write-Host "1. Install Vercel CLI: npm install -g vercel" -ForegroundColor Cyan
    Write-Host "2. Or deploy via GitHub: https://vercel.com/import" -ForegroundColor Cyan
    Write-Host "3. Or use Netlify: drag and drop 'dist' folder to https://netlify.com/drop" -ForegroundColor Cyan
}

Write-Host "🎉 Deployment process completed!" -ForegroundColor Green
Write-Host "📖 For detailed instructions, see: COMPLETE_DEPLOYMENT_GUIDE.md" -ForegroundColor Blue
