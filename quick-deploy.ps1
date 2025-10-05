# 🚀 اسکریپت Deploy سریع و ایمن
# Quick and Safe Deploy Script

param(
    [string]$BackendUrl = "",
    [string]$FrontendUrl = ""
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 شروع deploy سریع..." -ForegroundColor Green

# مرحله 1: بررسی prerequisites
Write-Host "🔍 بررسی ابزارهای لازم..." -ForegroundColor Yellow

$tools = @("node", "npm", "git")
foreach ($tool in $tools) {
    if (!(Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Host "❌ $tool پیدا نشد. لطفاً نصب کنید." -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ همه ابزارها موجود است" -ForegroundColor Green

# مرحله 2: آماده‌سازی پروژه
Write-Host "📦 آماده‌سازی پروژه..." -ForegroundColor Yellow

# نصب dependencies
npm install

# ایجاد .env.local اگر وجود ندارد
if (!(Test-Path ".env.local")) {
    @"
VITE_BACKEND_MODE=pocketbase
VITE_PB_URL=$BackendUrl
VITE_APP_NAME=سیستم مدیریت انبار دارو
VITE_DEVELOPER_NAME=علیرضا حامد
VITE_DEVELOPMENT_YEAR=1404
"@ | Out-File -FilePath ".env.local" -Encoding utf8
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

# مرحله 3: آماده‌سازی Git
Write-Host "📤 آماده‌سازی Git..." -ForegroundColor Yellow

# اگر git repository نیست
if (!(Test-Path ".git")) {
    git init
    Write-Host "✅ Git repository ایجاد شد" -ForegroundColor Green
}

# اضافه کردن فایل‌ها
git add .

# بررسی تغییرات
$gitStatus = git status --porcelain
if ($gitStatus) {
    $commitMessage = "🚀 Auto-deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm') - Pharmacy Inventory by Alireza Hamed"
    git commit -m $commitMessage
    Write-Host "✅ تغییرات commit شد" -ForegroundColor Green
} else {
    Write-Host "ℹ️ تغییری برای commit وجود ندارد" -ForegroundColor Blue
}

# مرحله 4: ایجاد فایل‌های deployment
Write-Host "📋 ایجاد فایل‌های deployment..." -ForegroundColor Yellow

# Dockerfile برای PocketBase
$dockerContent = @'
FROM alpine:latest

RUN apk add --no-cache curl unzip ca-certificates

WORKDIR /app

# دانلود PocketBase
RUN curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.30.1/pocketbase_0.30.1_linux_amd64.zip -o pb.zip && \
    unzip pb.zip && \
    rm pb.zip && \
    chmod +x pocketbase

# کپی schema و فایل‌های پروژه
COPY pocketbase_schema.json* ./
COPY pb_data/ ./pb_data/ 2>/dev/null || true

# ایجاد دایرکتوری‌های لازم
RUN mkdir -p pb_data

EXPOSE 8090

# اجرا با security headers
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090", "--dev=false"]
'@
$dockerContent | Out-File -FilePath "Dockerfile.pocketbase" -Encoding utf8

# fly.toml
$flyContent = @'
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

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512

[mounts]
  source = "pb_data"
  destination = "/app/pb_data"

[[statics]]
  guest_path = "/app/public"
  url_prefix = "/public"
'@
$flyContent | Out-File -FilePath "fly.toml" -Encoding utf8

# _redirects برای Cloudflare Pages SPA
if (!(Test-Path "dist")) {
    New-Item -ItemType Directory -Path "dist" -Force | Out-Null
}
"/*    /index.html   200" | Out-File -FilePath "dist/_redirects" -Encoding utf8

# _headers برای security
$headersContent = @'
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css  
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: public, max-age=0, must-revalidate
'@
$headersContent | Out-File -FilePath "dist/_headers" -Encoding utf8

Write-Host "✅ فایل‌های deployment آماده شد" -ForegroundColor Green

# مرحله 5: نمایش دستورات نهایی
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
Write-Host "- Connect to Git → انتخاب repository" -ForegroundColor Gray
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