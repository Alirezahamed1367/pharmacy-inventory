#!/bin/bash
# 🔐 اسکریپت راه‌اندازی سریع سیستم Backup
# 📧 ایمیل: alireza.h67@gmail.com  
# 👨‍💻 توسعه: علیرضا حامد - پاییز 1404

echo "🚀 شروع راه‌اندازی سیستم Backup خودکار..."

# بررسی وجود Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 نصب نیست. لطفاً ابتدا Python 3 را نصب کنید."
    exit 1
fi

# بررسی وجود pg_dump
if ! command -v pg_dump &> /dev/null; then
    echo "❌ PostgreSQL tools نصب نیست."
    echo "💡 Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "💡 macOS: brew install postgresql"
    echo "💡 Windows: دانلود از postgresql.org"
    exit 1
fi

# نصب پکیج‌های Python
echo "📦 نصب پکیج‌های مورد نیاز..."
pip3 install -r backup_requirements.txt

# ایجاد پوشه backups
mkdir -p backups
echo "📁 پوشه backups ایجاد شد"

# ایجاد فایل .env نمونه
if [ ! -f .env ]; then
    cat > .env << EOL
# تنظیمات پایگاه داده Supabase
SUPABASE_HOST=your-supabase-host.supabase.co
SUPABASE_PORT=5432
SUPABASE_DB=postgres
SUPABASE_USER=postgres
SUPABASE_PASSWORD=your-password

# تنظیمات GitHub
GITHUB_TOKEN=your-github-token

# تنظیمات ایمیل Gmail
GMAIL_EMAIL=your-backup-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
EOL
    echo "📋 فایل .env نمونه ایجاد شد - لطفاً آن را تکمیل کنید"
fi

# اجرای backup تست
echo "🧪 اجرای backup تست..."
python3 backup_system.py --now

echo "✅ راه‌اندازی تکمیل شد!"
echo ""
echo "📌 مراحل بعدی:"
echo "1. فایل .env را با اطلاعات واقعی تکمیل کنید"
echo "2. Gmail App Password تنظیم کنید"
echo "3. GitHub Token ایجاد کنید"
echo "4. برای اجرای دائمی: python3 backup_system.py"
echo ""
echo "📞 پشتیبانی: alireza.h67@gmail.com"