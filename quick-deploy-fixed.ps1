# 🚀 اسکریپت Deploy ساده و ایمن
# Simple and Safe Deploy Script

param(
    [string]$Action = "all"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 شروع deploy سریع..." -ForegroundColor Green

# بررسی ابزارهای لازم
Write-Host "🔍 بررسی ابزارهای لازم..." -ForegroundColor Yellow

$requiredTools = @("node", "npm", "git")
foreach ($tool in $requiredTools) {
    if (!(Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Host "❌ $tool پیدا نشد. لطفا نصب کنید." -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ همه ابزارها موجود است" -ForegroundColor Green

# آماده‌سازی پروژه
Write-Host "📦 آماده‌سازی پروژه..." -ForegroundColor Yellow

# نصب dependencies
npm install

# ایجاد .env.local
if (!(Test-Path ".env.local")) {
    $envContent = @"
VITE_BACKEND_MODE=pocketbase
VITE_PB_URL=https://pharmacy-inventory-pb.fly.dev
VITE_APP_NAME=سیستم مدیریت انبار دارو
VITE_DEVELOPER_NAME=علیرضا حامد
VITE_DEVELOPMENT_YEAR=1404
"@
    $envContent | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "📝 فایل .env.local ایجاد شد" -ForegroundColor Cyan
}

# Build پروژه
Write-Host "🏗️ Build پروژه..." -ForegroundColor Yellow
npm run build

if (!(Test-Path "dist")) {
    Write-Host "❌ Build ناموفق!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build موفق" -ForegroundColor Green

# آماده‌سازی Git
Write-Host "📤 آماده‌سازی Git..." -ForegroundColor Yellow

if (!(Test-Path ".git")) {
    git init
    Write-Host "✅ Git repository ایجاد شد" -ForegroundColor Green
}

git add .

$gitStatus = git status --porcelain
if ($gitStatus) {
    $commitMessage = "🚀 Auto-deploy: Pharmacy Inventory by Alireza Hamed"
    git commit -m $commitMessage
    Write-Host "✅ تغییرات commit شد" -ForegroundColor Green
} else {
    Write-Host "ℹ️ تغییری برای commit وجود ندارد" -ForegroundColor Blue
}

# ایجاد Dockerfile
Write-Host "📋 ایجاد فایل‌های deployment..." -ForegroundColor Yellow

$dockerContent = 'FROM alpine:latest

RUN apk add --no-cache curl unzip ca-certificates

WORKDIR /app

RUN curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.30.1/pocketbase_0.30.1_linux_amd64.zip -o pb.zip
RUN unzip pb.zip
RUN rm pb.zip
RUN chmod +x pocketbase

COPY pocketbase_schema.json* ./
RUN mkdir -p pb_data

EXPOSE 8090

CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]'

$dockerContent | Out-File -FilePath "Dockerfile.pocketbase" -Encoding utf8

# ایجاد fly.toml
$flyContent = 'app = "pharmacy-inventory-pb"
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
  destination = "/app/pb_data"'

$flyContent | Out-File -FilePath "fly.toml" -Encoding utf8

# ایجاد _redirects
if (!(Test-Path "dist")) {
    New-Item -ItemType Directory -Path "dist" -Force | Out-Null
}
"/*    /index.html   200" | Out-File -FilePath "dist/_redirects" -Encoding utf8

# ایجاد _headers
$headersContent = '/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css  
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: public, max-age=0, must-revalidate'

$headersContent | Out-File -FilePath "dist/_headers" -Encoding utf8

Write-Host "✅ فایل‌های deployment آماده شد" -ForegroundColor Green

# نمایش دستورات نهایی
Write-Host ""
Write-Host "🎯 مراحل نهایی deployment:" -ForegroundColor Cyan
Write-Host ""
Write-Host "📤 1. آپلود به GitHub:" -ForegroundColor White
Write-Host "git remote add origin https://github.com/[USERNAME]/pharmacy-inventory.git" -ForegroundColor Gray
Write-Host "git branch -M main" -ForegroundColor Gray
Write-Host "git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 2. Deploy Backend (Fly.io):" -ForegroundColor White
Write-Host "fly auth login" -ForegroundColor Gray
Write-Host "fly launch --name pharmacy-inventory-pb --region fra --yes" -ForegroundColor Gray
Write-Host "fly volumes create pb_data --region fra --size 1" -ForegroundColor Gray
Write-Host "fly deploy" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 3. Deploy Frontend (Cloudflare Pages):" -ForegroundColor White
Write-Host "- برو به: https://pages.cloudflare.com" -ForegroundColor Gray
Write-Host "- Connect to Git" -ForegroundColor Gray
Write-Host "- Framework: Vite, Build: npm run build, Output: dist" -ForegroundColor Gray
Write-Host "- Environment vars: VITE_BACKEND_MODE=pocketbase" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 URL ها:" -ForegroundColor Magenta
Write-Host "Backend: https://pharmacy-inventory-pb.fly.dev" -ForegroundColor Blue
Write-Host "Frontend: https://pharmacy-inventory.pages.dev" -ForegroundColor Blue
Write-Host "Admin: https://pharmacy-inventory-pb.fly.dev/_/" -ForegroundColor Blue
Write-Host ""
Write-Host "✅ آماده deployment! تمام فایل‌ها ایجاد شد." -ForegroundColor Green
Write-Host "💻 توسعه‌دهنده: علیرضا حامد - پاییز 1404" -ForegroundColor Magenta