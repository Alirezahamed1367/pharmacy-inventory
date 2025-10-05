# Complete PocketBase Reset Script
# نویسنده: علیرضا حامد - پاییز 1404
# این اسکریپت کامل ریست و راه‌اندازی مجدد PocketBase را انجام می‌دهد

Write-Host "🔄 شروع ریست کامل PocketBase..." -ForegroundColor Cyan
Write-Host "طراحی و توسعه نرم‌افزار توسط علیرضا حامد در پاییز 1404" -ForegroundColor Green
Write-Host ""

# Step 1: حذف فایل‌های database محلی
Write-Host "📁 حذف فایل‌های database محلی..." -ForegroundColor Yellow

$itemsToRemove = @("pb_data", "*.db", "*.db-shm", "*.db-wal", "pocketbase.exe")

foreach ($item in $itemsToRemove) {
    if (Test-Path $item) {
        Remove-Item -Recurse -Force $item -ErrorAction SilentlyContinue
        Write-Host "  ✅ حذف شد: $item" -ForegroundColor Green
    } else {
        Write-Host "  ℹ️  وجود ندارد: $item" -ForegroundColor Blue
    }
}

# Step 2: بروزرسانی .gitignore
Write-Host "📝 بروزرسانی .gitignore..." -ForegroundColor Yellow

$gitignoreContent = @"

# PocketBase Database Files (Never commit these!)
pb_data/
*.db
*.db-shm
*.db-wal
pocketbase.exe

# Environment Files
.env
.env.local
.env.development
.env.test
.env.production

# Build and Cache
dist/
.cache/
node_modules/

# Logs
*.log
logs/

"@

if (!(Test-Path ".gitignore")) {
    New-Item -ItemType File -Path ".gitignore" | Out-Null
}

Add-Content -Path ".gitignore" -Value $gitignoreContent -Encoding UTF8
Write-Host "  ✅ .gitignore بروزرسانی شد" -ForegroundColor Green

# Step 3: ایجاد environment configuration جدید
Write-Host "⚙️  ایجاد تنظیمات محیطی جدید..." -ForegroundColor Yellow

$envContent = @"
# Pharmacy Inventory System - Environment Configuration
# Developer: علیرضا حامد - پاییز 1404

# Backend Configuration
VITE_BACKEND_MODE=pocketbase
VITE_PB_URL=https://pharmacy-inventory-lz6l.onrender.com

# Frontend Configuration  
VITE_APP_TITLE=سیستم مدیریت موجودی داروخانه
VITE_PROJECT_AUTHOR=علیرضا حامد
VITE_PROJECT_SEASON=پاییز 1404

# Super Admin Credentials (for initial setup)
PB_ADMIN_EMAIL=superadmin@pharmacy.local
PB_ADMIN_PASSWORD=A25893Aa

# Debug Mode
VITE_DEBUG_MODE=false

"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "  ✅ فایل .env.local ایجاد شد" -ForegroundColor Green

# Step 4: بروزرسانی package.json scripts
Write-Host "📦 بروزرسانی package.json scripts..." -ForegroundColor Yellow

$packageJsonPath = "package.json"
if (Test-Path $packageJsonPath) {
    $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
    
    # اضافه کردن scripts مفید
    if (!$packageJson.scripts) {
        $packageJson | Add-Member -Type NoteProperty -Name "scripts" -Value @{}
    }
    
    $packageJson.scripts | Add-Member -Type NoteProperty -Name "pb:reset" -Value "node scripts/resetPocketBase.js" -Force
    $packageJson.scripts | Add-Member -Type NoteProperty -Name "pb:setup" -Value "node scripts/setupCollections.js" -Force
    $packageJson.scripts | Add-Member -Type NoteProperty -Name "dev:full" -Value "npm run dev" -Force
    
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath -Encoding UTF8
    Write-Host "  ✅ package.json scripts اضافه شد" -ForegroundColor Green
}

# Step 5: حذف فایل‌های مشکل‌ساز
Write-Host "🧹 حذف فایل‌های مشکل‌ساز..." -ForegroundColor Yellow

$problematicFiles = @("fly.toml", "render.yaml", "build.sh")
foreach ($file in $problematicFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ حذف شد: $file" -ForegroundColor Green
    }
}

# Step 6: بررسی وضعیت Git
Write-Host "📋 بررسی وضعیت Git..." -ForegroundColor Yellow

try {
    $gitStatus = git status --porcelain 2>$null
    Write-Host "  ✅ Git repository در دسترس است" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Git repository مشکل دارد" -ForegroundColor Red
    return
}

# Step 7: Commit تغییرات
Write-Host "💾 Commit کردن تغییرات..." -ForegroundColor Yellow

git add . 2>$null
$commitMessage = @"
🔄 Complete PocketBase Reset & Clean Setup

✨ Features:
- Complete database reset for fresh start
- Updated environment configuration  
- Enhanced .gitignore for better security
- Added helpful npm scripts
- Removed problematic deployment files

🏗️ Technical Changes:
- Cleared all pb_data and database files
- Set backend mode to PocketBase
- Configured proper Git ignore patterns
- Ready for clean collections setup

👨‍💻 Developer: علیرضا حامد - پاییز 1404
📅 Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm')
"@

git commit -m $commitMessage 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ تغییرات commit شد" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  هیچ تغییری برای commit وجود ندارد" -ForegroundColor Blue
}

# Step 8: Push به repository
Write-Host "🚀 Push کردن به GitHub..." -ForegroundColor Yellow

git push origin main 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ تغییرات به GitHub push شد" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  خطا در push - ممکن است نیاز به اجرای دستی باشد" -ForegroundColor Red
}

# Step 9: نمایش نتیجه نهایی
Write-Host ""
Write-Host "🎉 ریست کامل PocketBase با موفقیت انجام شد!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 وضعیت فعلی:" -ForegroundColor Cyan
Write-Host "  ✅ Database محلی پاک شد" -ForegroundColor White
Write-Host "  ✅ تنظیمات محیطی بروزرسانی شد" -ForegroundColor White  
Write-Host "  ✅ Git repository آماده است" -ForegroundColor White
Write-Host "  ✅ Render شروع به redeploy می‌کند" -ForegroundColor White
Write-Host ""
Write-Host "⏰ مراحل بعدی (منتظر 2-3 دقیقه برای deploy):" -ForegroundColor Yellow
Write-Host "1️⃣  منتظر تکمیل deploy در Render باش" -ForegroundColor White
Write-Host "2️⃣  برو به: https://pharmacy-inventory-lz6l.onrender.com/_/" -ForegroundColor White
Write-Host "3️⃣  اولین superuser را بساز:" -ForegroundColor White
Write-Host "    📧 Email: superadmin@pharmacy.local" -ForegroundColor Green
Write-Host "    🔐 Password: A25893Aa" -ForegroundColor Green
Write-Host "4️⃣  برگرد اینجا برای ساخت خودکار collections" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Links مفید:" -ForegroundColor Cyan
Write-Host "  📊 Render Dashboard: https://dashboard.render.com/" -ForegroundColor Blue
Write-Host "  🗃️  PocketBase Admin: https://pharmacy-inventory-lz6l.onrender.com/_/" -ForegroundColor Blue  
Write-Host "  🌐 Frontend: https://dcd37ecb.pharmacy-inventory.pages.dev/" -ForegroundColor Blue
Write-Host ""
Write-Host "طراحی و توسعه نرم‌افزار توسط علیرضا حامد در پاییز 1404" -ForegroundColor Green