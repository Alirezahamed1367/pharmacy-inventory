# 🇮🇷 اسکریپت استقرار خودکار برای ایران (ویندوز)
# Auto deployment script for Iran access (Windows)
# نویسنده: علیرضا حامد - پاییز 1404

param(
    [string]$Action = "all"
)

$ProjectName = "pharmacy-inventory-iran"
$FrontendUrl = ""
$BackendUrl = ""

Write-Host "🇮🇷 شروع استقرار سیستم انبارداری دارو برای ایران..." -ForegroundColor Green
Write-Host "🇮🇷 Starting pharmacy inventory deployment for Iran..." -ForegroundColor Green

# بررسی وجود ابزارهای لازم
function Test-Tools {
    Write-Host "🔍 بررسی ابزارهای لازم..." -ForegroundColor Yellow
    
    if (!(Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Node.js پیدا نشد. لطفاً نصب کنید: https://nodejs.org" -ForegroundColor Red
        exit 1
    }
    
    if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Host "❌ npm پیدا نشد. لطفاً Node.js را دوباره نصب کنید" -ForegroundColor Red
        exit 1
    }
    
    if (!(Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Git پیدا نشد. لطفاً نصب کنید: https://git-scm.com" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ همه ابزارهای لازم موجود است" -ForegroundColor Green
}

# آماده‌سازی پروژه
function Initialize-Project {
    Write-Host "📦 آماده‌سازی پروژه..." -ForegroundColor Yellow
    
    # نصب dependencies
    npm install
    
    # ایجاد فایل environment
    if (!(Test-Path ".env.local")) {
        Write-Host "⚙️ ایجاد فایل تنظیمات محیطی..." -ForegroundColor Blue
        @"
# تنظیمات برای استقرار ایران
VITE_BACKEND_MODE=pocketbase
VITE_PB_URL=https://your-pocketbase-url.fly.dev
VITE_APP_NAME=سیستم مدیریت انبار دارو
VITE_DEVELOPER_NAME=علیرضا حامد
VITE_DEVELOPMENT_YEAR=1404
"@ | Out-File -FilePath ".env.local" -Encoding utf8
        Write-Host "📝 فایل .env.local ایجاد شد. لطفاً URL backend را تنظیم کنید" -ForegroundColor Cyan
    }
    
    Write-Host "✅ پروژه آماده شد" -ForegroundColor Green
}

# Build پروژه
function Build-Project {
    Write-Host "🏗️ Build کردن پروژه..." -ForegroundColor Yellow
    
    npm run build
    
    if (!(Test-Path "dist")) {
        Write-Host "❌ Build ناموفق!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Build موفق" -ForegroundColor Green
}

# استقرار backend
function Deploy-Backend {
    Write-Host "🚀 آماده‌سازی backend..." -ForegroundColor Yellow
    
    # ایجاد Dockerfile برای PocketBase
    @"
FROM alpine:latest

RUN apk add --no-cache curl unzip

# دانلود PocketBase
WORKDIR /app
RUN curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.30.1/pocketbase_0.30.1_linux_amd64.zip -o pb.zip && \
    unzip pb.zip && \
    rm pb.zip && \
    chmod +x pocketbase

# کپی schema اگر وجود دارد
COPY pocketbase_schema.json* ./
COPY pb_data/ ./pb_data/ 2>/dev/null || true

# کپی فایل‌های init اگر وجود دارد
COPY scripts/pbInit.mjs* ./scripts/ 2>/dev/null || true

EXPOSE 8090

# اجرا با تنظیمات production
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090", "--publicDir=/app/public"]
"@ | Out-File -FilePath "Dockerfile.pocketbase" -Encoding utf8
    
    # ایجاد fly.toml با تنظیمات بهینه
    @"
app = "$ProjectName-pb"
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
  memory_mb = 256

[mounts]
  source = "pb_data"
  destination = "/app/pb_data"
"@ | Out-File -FilePath "fly.toml" -Encoding utf8
    
    Write-Host "📋 فایل‌های backend آماده شد" -ForegroundColor Green
    
    # راهنمای deployment
    Write-Host ""
    Write-Host "🔗 برای استقرار backend:" -ForegroundColor Cyan
    Write-Host "1. ثبت‌نام در https://fly.io" -ForegroundColor White
    Write-Host "2. نصب Fly CLI: iwr https://fly.io/install.ps1 -useb | iex" -ForegroundColor White
    Write-Host "3. ورود: fly auth login" -ForegroundColor White
    Write-Host "4. اجرا: fly launch --name $ProjectName-pb" -ForegroundColor White
    Write-Host "5. Volume ایجاد: fly volumes create pb_data --region fra --size 1" -ForegroundColor White
    Write-Host "6. Deploy: fly deploy" -ForegroundColor White
}

# استقرار frontend
function Deploy-Frontend {
    Write-Host "🌐 آماده‌سازی frontend..." -ForegroundColor Yellow
    
    # ایجاد _redirects برای SPA
    if (!(Test-Path "dist")) {
        New-Item -ItemType Directory -Path "dist" -Force | Out-Null
    }
    "/*    /index.html   200" | Out-File -FilePath "dist/_redirects" -Encoding utf8
    
    # ایجاد pages.json برای Cloudflare
    @"
{
  "name": "$ProjectName",
  "build": {
    "command": "npm run build",
    "output": "dist"
  },
  "env": {
    "VITE_BACKEND_MODE": "pocketbase"
  }
}
"@ | Out-File -FilePath "pages.json" -Encoding utf8
    
    Write-Host "📋 فایل‌های frontend آماده شد" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 برای استقرار frontend:" -ForegroundColor Cyan
    Write-Host "1. Push کردن کد به GitHub" -ForegroundColor White
    Write-Host "2. ثبت‌نام در https://pages.cloudflare.com" -ForegroundColor White
    Write-Host "3. Connect to Git → انتخاب repository" -ForegroundColor White
    Write-Host "4. Build settings:" -ForegroundColor White
    Write-Host "   - Framework: Vite" -ForegroundColor Gray
    Write-Host "   - Build command: npm run build" -ForegroundColor Gray
    Write-Host "   - Build output: dist" -ForegroundColor Gray
    Write-Host "5. Environment variables:" -ForegroundColor White
    Write-Host "   - VITE_BACKEND_MODE=pocketbase" -ForegroundColor Gray
    Write-Host "   - VITE_PB_URL=https://$ProjectName-pb.fly.dev" -ForegroundColor Gray
}

# تست deployment
function Test-Deployment {
    Write-Host "🧪 تست deployment..." -ForegroundColor Yellow
    
    if ($BackendUrl) {
        Write-Host "🔍 تست backend health..." -ForegroundColor Blue
        try {
            $response = Invoke-WebRequest -Uri "$BackendUrl/api/health" -Method Get -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Backend سالم است" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Backend مشکل دارد (Status: $($response.StatusCode))" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "⚠️ Backend در دسترس نیست" -ForegroundColor Yellow
        }
    }
    
    if ($FrontendUrl) {
        Write-Host "🔍 تست frontend..." -ForegroundColor Blue
        try {
            $response = Invoke-WebRequest -Uri $FrontendUrl -Method Get -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Frontend در دسترس است" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Frontend مشکل دارد (Status: $($response.StatusCode))" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "⚠️ Frontend در دسترس نیست" -ForegroundColor Yellow
        }
    }
}

# راهنمای تکمیل
function Show-CompletionGuide {
    Write-Host ""
    Write-Host "🎉 آماده‌سازی تکمیل شد!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 مراحل باقی‌مانده:" -ForegroundColor Cyan
    Write-Host "1. Backend را در Fly.io deploy کنید" -ForegroundColor White
    Write-Host "2. Frontend را در Cloudflare Pages deploy کنید" -ForegroundColor White
    Write-Host "3. URL های تولید شده را در .env.local قرار دهید" -ForegroundColor White
    Write-Host "4. کالکشن‌های دیتابیس را ایجاد کنید" -ForegroundColor White
    Write-Host ""
    Write-Host "📞 در صورت نیاز به کمک:" -ForegroundColor Yellow
    Write-Host "- GitHub Issues: repository خود" -ForegroundColor White
    Write-Host "- مستندات: DEPLOYMENT_IRAN.md" -ForegroundColor White
    Write-Host ""
    Write-Host "💻 توسعه‌دهنده: علیرضا حامد - پاییز 1404" -ForegroundColor Magenta
}

# اجرای اصلی
function Start-Main {
    Test-Tools
    Initialize-Project
    Build-Project
    Deploy-Backend
    Deploy-Frontend
    Test-Deployment
    Show-CompletionGuide
}

# Handle command line arguments
switch ($Action.ToLower()) {
    "tools" {
        Test-Tools
        break
    }
    "prepare" {
        Initialize-Project
        break
    }
    "build" {
        Build-Project
        break
    }
    "backend" {
        Deploy-Backend
        break
    }
    "frontend" {
        Deploy-Frontend
        break
    }
    "test" {
        Test-Deployment
        break
    }
    "all" {
        Start-Main
        break
    }
    default {
        Start-Main
        break
    }
}