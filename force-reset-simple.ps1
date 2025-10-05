# Simple Force Reset PocketBase
Write-Host "شروع عملیات ریست کامل..." -ForegroundColor Yellow

# Step 1: Clean local files
Write-Host "حذف فایل‌های محلی..." -ForegroundColor Cyan
if (Test-Path "pb_data") {
    Remove-Item "pb_data" -Recurse -Force
    Write-Host "pb_data حذف شد" -ForegroundColor Green
}

# Step 2: Create reset trigger with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
Set-Content -Path "db_reset_trigger.txt" -Value "FORCE_RESET_$timestamp`nClean database required`nTimestamp: $timestamp"
Write-Host "تریگر ریست ایجاد شد: $timestamp" -ForegroundColor Green

# Step 3: Commit and push to trigger rebuild
Write-Host "ارسال تغییرات به Git..." -ForegroundColor Cyan
git add .
git commit -m "Force database reset: $timestamp"
git push origin main

Write-Host "کامل! منتظر rebuild باشید (۳-۴ دقیقه)" -ForegroundColor Green
Write-Host "سپس بروید به: https://pharmacy-inventory-lz6l.onrender.com/_/" -ForegroundColor Yellow