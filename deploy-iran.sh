#!/bin/bash
# اسکریپت استقرار خودکار برای ایران
# Auto deployment script for Iran access
# نویسنده: علیرضا حامد - پاییز 1404

set -e

PROJECT_NAME="pharmacy-inventory-iran"
FRONTEND_URL=""
BACKEND_URL=""

echo "🇮🇷 شروع استقرار سیستم انبارداری دارو برای ایران..."
echo "🇮🇷 Starting pharmacy inventory deployment for Iran..."

# بررسی وجود ابزارهای لازم
check_tools() {
    echo "🔍 بررسی ابزارهای لازم..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js پیدا نشد. لطفاً نصب کنید: https://nodejs.org"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm پیدا نشد. لطفاً Node.js را دوباره نصب کنید"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git پیدا نشد. لطفاً نصب کنید: https://git-scm.com"
        exit 1
    fi
    
    echo "✅ همه ابزارهای لازم موجود است"
}

# آماده‌سازی پروژه
prepare_project() {
    echo "📦 آماده‌سازی پروژه..."
    
    # نصب dependencies
    npm install
    
    # ایجاد فایل environment
    if [ ! -f ".env.local" ]; then
        echo "⚙️ ایجاد فایل تنظیمات محیطی..."
        cat > .env.local << EOF
# تنظیمات برای استقرار ایران
VITE_BACKEND_MODE=pocketbase
VITE_PB_URL=https://your-pocketbase-url.fly.dev
VITE_APP_NAME=سیستم مدیریت انبار دارو
VITE_DEVELOPER_NAME=علیرضا حامد
VITE_DEVELOPMENT_YEAR=1404
EOF
        echo "📝 فایل .env.local ایجاد شد. لطفاً URL backend را تنظیم کنید"
    fi
    
    echo "✅ پروژه آماده شد"
}

# Build پروژه
build_project() {
    echo "🏗️ Build کردن پروژه..."
    
    npm run build
    
    if [ ! -d "dist" ]; then
        echo "❌ Build ناموفق!"
        exit 1
    fi
    
    echo "✅ Build موفق"
}

# استقرار backend
deploy_backend() {
    echo "🚀 آماده‌سازی backend..."
    
    # ایجاد Dockerfile برای PocketBase
    cat > Dockerfile.pocketbase << 'EOF'
FROM alpine:latest

RUN apk add --no-cache curl

# دانلود PocketBase
WORKDIR /app
RUN curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.30.1/pocketbase_0.30.1_linux_amd64.zip -o pb.zip
RUN unzip pb.zip && rm pb.zip

# کپی schema اگر وجود دارد
COPY pocketbase_schema.json* ./
COPY pb_data/ ./pb_data/ 2>/dev/null || :

EXPOSE 8090

CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]
EOF
    
    # ایجاد fly.toml
    cat > fly.toml << EOF
app = "$PROJECT_NAME-pb"
primary_region = "fra"

[build]
  dockerfile = "Dockerfile.pocketbase"

[http_service]
  internal_port = 8090
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256

[mounts]
  source = "pb_data"
  destination = "/app/pb_data"
EOF
    
    echo "📋 فایل‌های backend آماده شد"
    
    # راهنمای deployment
    echo ""
    echo "🔗 برای استقرار backend:"
    echo "1. ثبت‌نام در https://fly.io"
    echo "2. نصب Fly CLI: curl -L https://fly.io/install.sh | sh"
    echo "3. ورود: fly auth login"
    echo "4. اجرا: fly launch --name $PROJECT_NAME-pb"
    echo "5. Volume ایجاد: fly volumes create pb_data --region fra --size 1"
    echo "6. Deploy: fly deploy"
}

# استقرار frontend
deploy_frontend() {
    echo "🌐 آماده‌سازی frontend..."
    
    # ایجاد _redirects برای SPA
    mkdir -p dist
    echo "/*    /index.html   200" > dist/_redirects
    
    # ایجاد pages.json برای Cloudflare
    cat > pages.json << EOF
{
  "name": "$PROJECT_NAME",
  "build": {
    "command": "npm run build",
    "output": "dist"
  },
  "env": {
    "VITE_BACKEND_MODE": "pocketbase"
  }
}
EOF
    
    echo "📋 فایل‌های frontend آماده شد"
    echo ""
    echo "🔗 برای استقرار frontend:"
    echo "1. Push کردن کد به GitHub"
    echo "2. ثبت‌نام در https://pages.cloudflare.com"
    echo "3. Connect to Git → انتخاب repository"
    echo "4. Build settings:"
    echo "   - Framework: Vite"
    echo "   - Build command: npm run build"
    echo "   - Build output: dist"
    echo "5. Environment variables:"
    echo "   - VITE_BACKEND_MODE=pocketbase"
    echo "   - VITE_PB_URL=https://$PROJECT_NAME-pb.fly.dev"
}

# تست deployment
test_deployment() {
    echo "🧪 تست deployment..."
    
    if [ -n "$BACKEND_URL" ]; then
        echo "🔍 تست backend health..."
        if curl -f "$BACKEND_URL/api/health" > /dev/null 2>&1; then
            echo "✅ Backend سالم است"
        else
            echo "⚠️ Backend در دسترس نیست"
        fi
    fi
    
    if [ -n "$FRONTEND_URL" ]; then
        echo "🔍 تست frontend..."
        if curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
            echo "✅ Frontend در دسترس است"
        else
            echo "⚠️ Frontend در دسترس نیست"
        fi
    fi
}

# راهنمای تکمیل
show_completion_guide() {
    echo ""
    echo "🎉 آماده‌سازی تکمیل شد!"
    echo ""
    echo "📋 مراحل باقی‌مانده:"
    echo "1. Backend را در Fly.io deploy کنید"
    echo "2. Frontend را در Cloudflare Pages deploy کنید"
    echo "3. URL های تولید شده را در .env.local قرار دهید"
    echo "4. کالکشن‌های دیتابیس را ایجاد کنید"
    echo ""
    echo "📞 در صورت نیاز به کمک:"
    echo "- GitHub Issues: repository خود"
    echo "- مستندات: DEPLOYMENT_IRAN.md"
    echo ""
    echo "💻 توسعه‌دهنده: علیرضا حامد - پاییز 1404"
}

# اجرای اصلی
main() {
    check_tools
    prepare_project
    build_project
    deploy_backend
    deploy_frontend
    test_deployment
    show_completion_guide
}

# Handle command line arguments
case "${1:-all}" in
    "tools")
        check_tools
        ;;
    "prepare")
        prepare_project
        ;;
    "build")
        build_project
        ;;
    "backend")
        deploy_backend
        ;;
    "frontend")
        deploy_frontend
        ;;
    "test")
        test_deployment
        ;;
    "all"|*)
        main
        ;;
esac