# Force Complete Database Reset
# This will completely wipe server database

Write-Host "🔄 Force complete database reset on server..." -ForegroundColor Red
Write-Host ""

# Step 1: Remove ALL PocketBase related files and configs
Write-Host "🗑️ Removing all PocketBase files..." -ForegroundColor Yellow

$itemsToRemove = @(
    "pb_data",
    "*.db", 
    "*.db-shm",
    "*.db-wal",
    "pocketbase.exe",
    "pocketbase",
    "pocketbase_schema.json"
)

foreach ($item in $itemsToRemove) {
    if (Test-Path $item) {
        Remove-Item -Recurse -Force $item -ErrorAction SilentlyContinue
        Write-Host "  ✅ Removed: $item" -ForegroundColor Green
    }
}

# Step 2: Create a dummy file to force Docker rebuild
Write-Host "🔨 Creating trigger for Docker rebuild..." -ForegroundColor Yellow

$triggerContent = @"
# Database Reset Trigger
# Created: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
# This file forces Docker to rebuild and start fresh

RESET_TIMESTAMP=$(Get-Date -Format 'yyyyMMddHHmmss')
DATABASE_STATE=COMPLETELY_CLEAN
FORCE_REBUILD=true
"@

$triggerContent | Out-File -FilePath "pb_reset_trigger.txt" -Encoding UTF8
Write-Host "  ✅ Reset trigger created" -ForegroundColor Green

# Step 3: Update Dockerfile to ensure clean start
Write-Host "📝 Updating Dockerfile for clean start..." -ForegroundColor Yellow

$dockerfileContent = @"
FROM alpine:latest

# Install required packages
RUN apk add --no-cache curl unzip ca-certificates bash

WORKDIR /app

# Download and extract PocketBase with complete cleanup
RUN echo "Starting fresh PocketBase installation..." && \
    curl -L -o pb.zip "https://github.com/pocketbase/pocketbase/releases/download/v0.30.1/pocketbase_0.30.1_linux_amd64.zip" && \
    echo "Downloaded successfully. Extracting..." && \
    unzip pb.zip && \
    rm pb.zip && \
    chmod +x pocketbase && \
    echo "PocketBase setup complete:" && \
    ls -la /app/pocketbase

# Ensure completely clean database directory
RUN rm -rf /app/pb_data && mkdir -p /app/pb_data && chmod 755 /app/pb_data

# Copy reset trigger (this changes on each reset)
COPY pb_reset_trigger.txt ./

EXPOSE 8090

# Start PocketBase with clean database
CMD ["/app/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/app/pb_data"]
"@

$dockerfileContent | Out-File -FilePath "Dockerfile" -Encoding UTF8
Write-Host "  ✅ Dockerfile updated for clean start" -ForegroundColor Green

# Step 4: Commit and force redeploy
Write-Host "🚀 Forcing redeploy with clean database..." -ForegroundColor Cyan

git add .
git commit -m "🔄 FORCE COMPLETE DATABASE RESET

- Removed all PocketBase data files
- Created rebuild trigger: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
- Updated Dockerfile for guaranteed clean start
- Server will start with completely empty database
- Ready for fresh superuser creation"

git push origin main

Write-Host ""
Write-Host "✅ Force reset completed!" -ForegroundColor Green
Write-Host ""
Write-Host "⏳ IMPORTANT: Wait 3-4 minutes for complete redeploy" -ForegroundColor Red
Write-Host ""
Write-Host "🎯 After redeploy completes:" -ForegroundColor Yellow
Write-Host "1. Go to: https://pharmacy-inventory-lz6l.onrender.com/_/" -ForegroundColor White
Write-Host "2. You should see 'Create your first admin' page" -ForegroundColor White
Write-Host "3. If you see login page, wait more - redeploy not complete" -ForegroundColor Red
Write-Host "4. Create superuser:" -ForegroundColor White
Write-Host "   📧 Email: superadmin@pharmacy.local" -ForegroundColor Green
Write-Host "   🔐 Password: A25893Aa" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 To check redeploy status:" -ForegroundColor Cyan
Write-Host "   Go to Render Dashboard > Your Service > Logs" -ForegroundColor White
Write-Host ""