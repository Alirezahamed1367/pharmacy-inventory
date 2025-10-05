# Complete PocketBase Reset Script
# Author: Alireza Hamed - Fall 1404
# Simple version without encoding issues

Write-Host "Starting complete PocketBase reset..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Remove local database files
Write-Host "Removing local database files..." -ForegroundColor Yellow

$itemsToRemove = @("pb_data", "*.db", "*.db-shm", "*.db-wal")

foreach ($item in $itemsToRemove) {
    if (Test-Path $item) {
        Remove-Item -Recurse -Force $item -ErrorAction SilentlyContinue
        Write-Host "  Removed: $item" -ForegroundColor Green
    }
}

# Step 2: Update .gitignore
Write-Host "Updating .gitignore..." -ForegroundColor Yellow

$gitignoreContent = @"

# PocketBase Database Files
pb_data/
*.db
*.db-shm
*.db-wal

# Environment Files
.env
.env.local
.env.development
.env.test
.env.production

"@

Add-Content -Path ".gitignore" -Value $gitignoreContent -Encoding UTF8
Write-Host "  .gitignore updated" -ForegroundColor Green

# Step 3: Create new environment configuration
Write-Host "Creating new environment configuration..." -ForegroundColor Yellow

$envContent = @"
# Pharmacy Inventory System Configuration
VITE_BACKEND_MODE=pocketbase
VITE_PB_URL=https://pharmacy-inventory-lz6l.onrender.com
PB_ADMIN_EMAIL=superadmin@pharmacy.local
PB_ADMIN_PASSWORD=A25893Aa
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "  .env.local created" -ForegroundColor Green

# Step 4: Git operations
Write-Host "Committing changes..." -ForegroundColor Yellow

git add .
git commit -m "Complete PocketBase reset - fresh start"
git push origin main

Write-Host "  Changes pushed to GitHub" -ForegroundColor Green

# Step 5: Final instructions
Write-Host ""
Write-Host "Reset completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Wait for Render redeploy (2-3 minutes)" -ForegroundColor White
Write-Host "2. Go to: https://pharmacy-inventory-lz6l.onrender.com/_/" -ForegroundColor White
Write-Host "3. Create first superuser:" -ForegroundColor White
Write-Host "   Email: superadmin@pharmacy.local" -ForegroundColor Green
Write-Host "   Password: A25893Aa" -ForegroundColor Green
Write-Host "4. Return here for automated collections setup" -ForegroundColor White
Write-Host ""