# Pharmacy Inventory Deploy Script
# Auto deployment script for Iran access

param([string]$Action = "all")

$ErrorActionPreference = "Stop"

Write-Host "Starting deployment..." -ForegroundColor Green

# Check required tools
Write-Host "Checking required tools..." -ForegroundColor Yellow

$tools = @("node", "npm", "git")
foreach ($tool in $tools) {
    if (!(Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: $tool not found. Please install it." -ForegroundColor Red
        exit 1
    }
}
Write-Host "All tools available" -ForegroundColor Green

# Prepare project
Write-Host "Preparing project..." -ForegroundColor Yellow

# Install dependencies
npm install

# Create .env.local
if (!(Test-Path ".env.local")) {
    $envContent = "VITE_BACKEND_MODE=pocketbase`nVITE_PB_URL=https://pharmacy-inventory-pb.fly.dev`nVITE_APP_NAME=Pharmacy Inventory System`nVITE_DEVELOPER_NAME=Alireza Hamed"
    $envContent | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host ".env.local created" -ForegroundColor Cyan
}

# Build project
Write-Host "Building project..." -ForegroundColor Yellow
npm run build

if (!(Test-Path "dist")) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Build successful" -ForegroundColor Green

# Prepare Git
Write-Host "Preparing Git..." -ForegroundColor Yellow

if (!(Test-Path ".git")) {
    git init
    Write-Host "Git repository created" -ForegroundColor Green
}

git add .

$gitStatus = git status --porcelain
if ($gitStatus) {
    git commit -m "Auto-deploy: Pharmacy Inventory by Alireza Hamed"
    Write-Host "Changes committed" -ForegroundColor Green
} else {
    Write-Host "No changes to commit" -ForegroundColor Blue
}

# Create deployment files
Write-Host "Creating deployment files..." -ForegroundColor Yellow

# Dockerfile
$dockerContent = @"
FROM alpine:latest

RUN apk add --no-cache curl unzip ca-certificates

WORKDIR /app

RUN curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.30.1/pocketbase_0.30.1_linux_amd64.zip -o pb.zip
RUN unzip pb.zip
RUN rm pb.zip
RUN chmod +x pocketbase

COPY pocketbase_schema.json* ./
RUN mkdir -p pb_data

EXPOSE 8090

CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]
"@

$dockerContent | Out-File -FilePath "Dockerfile.pocketbase" -Encoding utf8

# fly.toml
$flyContent = @"
app = "pharmacy-inventory-pb"
primary_region = "fra"

[build]
  dockerfile = "Dockerfile.pocketbase"

[http_service]
  internal_port = 8090
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[env]
  PORT = "8090"

[mounts]
  source = "pb_data"
  destination = "/app/pb_data"
"@

$flyContent | Out-File -FilePath "fly.toml" -Encoding utf8

# Create dist directory and files
if (!(Test-Path "dist")) {
    New-Item -ItemType Directory -Path "dist" -Force | Out-Null
}

"/*    /index.html   200" | Out-File -FilePath "dist/_redirects" -Encoding utf8

$headersContent = @"
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css  
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: public, max-age=0, must-revalidate
"@

$headersContent | Out-File -FilePath "dist/_headers" -Encoding utf8

Write-Host "Deployment files created" -ForegroundColor Green

# Show next steps
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Upload to GitHub:" -ForegroundColor White
Write-Host "git remote add origin https://github.com/[USERNAME]/pharmacy-inventory.git" -ForegroundColor Gray
Write-Host "git branch -M main" -ForegroundColor Gray
Write-Host "git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Deploy Backend (Fly.io):" -ForegroundColor White
Write-Host "fly auth login" -ForegroundColor Gray
Write-Host "fly launch --name pharmacy-inventory-pb --region fra --yes" -ForegroundColor Gray
Write-Host "fly volumes create pb_data --region fra --size 1" -ForegroundColor Gray
Write-Host "fly deploy" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Deploy Frontend (Cloudflare Pages):" -ForegroundColor White
Write-Host "- Go to: https://pages.cloudflare.com" -ForegroundColor Gray
Write-Host "- Connect to Git" -ForegroundColor Gray
Write-Host "- Framework: Vite, Build: npm run build, Output: dist" -ForegroundColor Gray
Write-Host "- Environment vars: VITE_BACKEND_MODE=pocketbase" -ForegroundColor Gray
Write-Host ""
Write-Host "URLs:" -ForegroundColor Magenta
Write-Host "Backend: https://pharmacy-inventory-pb.fly.dev" -ForegroundColor Blue
Write-Host "Frontend: https://pharmacy-inventory.pages.dev" -ForegroundColor Blue
Write-Host "Admin: https://pharmacy-inventory-pb.fly.dev/_/" -ForegroundColor Blue
Write-Host ""
Write-Host "Ready for deployment! All files created." -ForegroundColor Green
Write-Host "Developer: Alireza Hamed - Fall 1404" -ForegroundColor Magenta