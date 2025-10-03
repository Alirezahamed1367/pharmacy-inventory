# 🔐 سیستم پشتیبان‌گیری خودکار
# برای سیستم مدیریت انبار داروخانه
# 📧 ایمیل: alireza.h67@gmail.com
# 👨‍💻 توسعه: علیرضا حامد - پاییز 1404

import os
import json
import schedule
import time
import smtplib
import zipfile
import tarfile
import subprocess
import psycopg2
import hashlib
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import requests
import base64

class PharmacyBackupSystem:
    def __init__(self):
        # تنظیمات پایگاه داده
        self.db_config = {
            'host': os.getenv('SUPABASE_HOST', 'localhost'),
            'port': os.getenv('SUPABASE_PORT', '5432'),
            'database': os.getenv('SUPABASE_DB', 'postgres'),
            'user': os.getenv('SUPABASE_USER', 'postgres'),
            'password': os.getenv('SUPABASE_PASSWORD', '')
        }
        
        # نسخه سیستم
        self.system_version = '2.0'

        # تنظیمات ایمیل (قابل غیرفعال‌سازی با ENV)
        self.email_config = {
            'smtp_server': 'smtp.gmail.com',
            'smtp_port': 587,
            'email': 'your-backup-email@gmail.com',  # ایمیل فرستنده
            'password': 'your-app-password',  # App Password گوگل
            'recipient': 'alireza.h67@gmail.com',
            'enabled': os.getenv('BACKUP_EMAIL_ENABLED', 'true').lower() == 'true'
        }
        
        # تنظیمات GitHub (قابل غیرفعال‌سازی)
        self.github_config = {
            'token': os.getenv('GITHUB_TOKEN', ''),
            'repo': 'Alirezahamed1367/pharmacy-inventory',
            'branch': 'backups',
            'enabled': os.getenv('BACKUP_GITHUB_ENABLED', 'true').lower() == 'true'
        }
        
        # مسیرهای محلی
        self.local_backup_path = 'backups'
        self.max_local_backups = int(os.getenv('BACKUP_MAX_LOCAL', '30'))  # حداکثر فایل‌های محلی
        self.create_targz = os.getenv('BACKUP_TAR_GZ', 'false').lower() == 'true'

        # ایجاد پوشه backup اگر وجود ندارد
        os.makedirs(self.local_backup_path, exist_ok=True)

    def create_database_backup(self):
        """ایجاد فایل backup از پایگاه داده"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f'pharmacy_backup_{timestamp}.sql'
        backup_path = os.path.join(self.local_backup_path, backup_filename)
        
        try:
            # استفاده از pg_dump برای backup
            pg_dump_cmd = [
                'pg_dump',
                f'--host={self.db_config["host"]}',
                f'--port={self.db_config["port"]}',
                f'--username={self.db_config["user"]}',
                f'--dbname={self.db_config["database"]}',
                '--verbose',
                '--clean',
                '--no-owner',
                '--no-privileges',
                f'--file={backup_path}'
            ]
            
            # تنظیم متغیر محیطی برای رمز عبور
            env = os.environ.copy()
            env['PGPASSWORD'] = self.db_config['password']
            
            result = subprocess.run(pg_dump_cmd, env=env, capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"✅ Backup ایجاد شد: {backup_path}")
                return backup_path
            else:
                print(f"❌ خطا در ایجاد backup: {result.stderr}")
                return None
                
        except Exception as e:
            print(f"❌ خطا در backup: {str(e)}")
            return None

    def snapshot_table_list(self):
        """دریافت لیست جداول برای ثبت در متادیتا"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cur = conn.cursor()
            cur.execute("""SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;""")
            tables = [r[0] for r in cur.fetchall()]
            cur.close(); conn.close()
            return tables
        except Exception as e:
            return [f'ERROR: {e}']

    def sha256_file(self, path):
        h = hashlib.sha256()
        with open(path, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                h.update(chunk)
        return h.hexdigest()

    def create_metadata_file(self, backup_path):
        """ایجاد فایل اطلاعات backup همراه با هش، جدول‌ها و نسخه"""
        metadata = {
            'backup_date': datetime.now().isoformat(),
            'database': {
                'host': self.db_config['host'],
                'name': self.db_config['database']
            },
            'system': {
                'created_by': 'علیرضا حامد',
                'version': self.system_version,
                'description': 'Backup خودکار سیستم مدیریت انبار داروخانه'
            },
            'file': {
                'name': os.path.basename(backup_path),
                'size_mb': round(os.path.getsize(backup_path) / 1024 / 1024, 2),
                'sha256': self.sha256_file(backup_path)
            },
            'tables': self.snapshot_table_list()
        }
        metadata_path = backup_path.replace('.sql', '_metadata.json')
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        return metadata_path

    def compress_backup(self, backup_path, metadata_path):
        """فشرده‌سازی فایل‌های backup (ZIP یا TAR.GZ)"""
        base = backup_path.replace('.sql', '')
        if self.create_targz:
            archive_path = base + '.tar.gz'
            with tarfile.open(archive_path, 'w:gz') as tar:
                tar.add(backup_path, arcname=os.path.basename(backup_path))
                tar.add(metadata_path, arcname=os.path.basename(metadata_path))
        else:
            archive_path = base + '.zip'
            with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                zipf.write(backup_path, os.path.basename(backup_path))
                zipf.write(metadata_path, os.path.basename(metadata_path))
        os.remove(backup_path); os.remove(metadata_path)
        print(f"✅ فایل فشرده شد: {archive_path}")
        return archive_path

    def send_email_backup(self, zip_path):
        """ارسال backup به ایمیل"""
        if not self.email_config.get('enabled', True):
            print('📭 ارسال ایمیل غیرفعال است (BACKUP_EMAIL_ENABLED=false)')
            return False
        try:
            msg = MIMEMultipart()
            msg['From'] = self.email_config['email']
            msg['To'] = self.email_config['recipient']
            msg['Subject'] = f'🔐 Backup خودکار سیستم داروخانه - {datetime.now().strftime("%Y/%m/%d")}'
            
            # متن ایمیل
            body = f"""
سلام آقای حامد،

Backup خودکار سیستم مدیریت انبار داروخانه با موفقیت ایجاد شد.

📊 اطلاعات Backup:
• تاریخ: {datetime.now().strftime('%Y/%m/%d %H:%M:%S')}
• حجم فایل: {round(os.path.getsize(zip_path) / 1024 / 1024, 2)} مگابایت
• نوع: Backup کامل پایگاه داده

⚠️ نکات امنیتی:
• این فایل حاوی تمام اطلاعات سیستم است
• در محل امنی نگهداری کنید
• برای بازیابی از اسکریپت reset_system.sql استفاده کنید

🔧 سیستم Backup خودکار
طراحی و توسعه: علیرضا حامد
تاریخ توسعه: پاییز 1404

با احترام،
سیستم خودکار پشتیبان‌گیری
            """
            
            msg.attach(MIMEText(body, 'plain', 'utf-8'))
            
            # ضمیمه کردن فایل backup
            with open(zip_path, "rb") as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename= {os.path.basename(zip_path)}'
                )
                msg.attach(part)
            
            # ارسال ایمیل
            server = smtplib.SMTP(self.email_config['smtp_server'], self.email_config['smtp_port'])
            server.starttls()
            server.login(self.email_config['email'], self.email_config['password'])
            text = msg.as_string()
            server.sendmail(self.email_config['email'], self.email_config['recipient'], text)
            server.quit()
            
            print(f"✅ ایمیل ارسال شد به: {self.email_config['recipient']}")
            return True
            
        except Exception as e:
            print(f"❌ خطا در ارسال ایمیل: {str(e)}")
            return False

    def upload_to_github(self, zip_path):
        """آپلود backup به GitHub"""
        if not self.github_config.get('enabled', True):
            print('🐙 آپلود GitHub غیرفعال است (BACKUP_GITHUB_ENABLED=false)')
            return False
        try:
            if not self.github_config['token']:
                print("⚠️ GitHub token تنظیم نشده است")
                return False
            
            # خواندن فایل
            with open(zip_path, 'rb') as f:
                content = base64.b64encode(f.read()).decode()
            
            # نام فایل در GitHub
            github_filename = f"backups/{os.path.basename(zip_path)}"
            
            # API request
            url = f"https://api.github.com/repos/{self.github_config['repo']}/contents/{github_filename}"
            
            data = {
                'message': f'Backup خودکار - {datetime.now().strftime("%Y/%m/%d %H:%M:%S")}',
                'content': content,
                'branch': self.github_config['branch']
            }
            
            headers = {
                'Authorization': f'token {self.github_config["token"]}',
                'Accept': 'application/vnd.github.v3+json'
            }
            
            response = requests.put(url, json=data, headers=headers)
            
            if response.status_code in [200, 201]:
                print(f"✅ فایل به GitHub آپلود شد: {github_filename}")
                return True
            else:
                print(f"❌ خطا در آپلود به GitHub: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ خطا در آپلود GitHub: {str(e)}")
            return False

    def cleanup_old_backups(self):
        """پاک کردن backup های قدیمی محلی"""
        try:
            backup_files = []
            for filename in os.listdir(self.local_backup_path):
                if filename.startswith('pharmacy_backup_') and filename.endswith('.zip'):
                    filepath = os.path.join(self.local_backup_path, filename)
                    backup_files.append((filepath, os.path.getctime(filepath)))
            
            # مرتب‌سازی بر اساس تاریخ ایجاد
            backup_files.sort(key=lambda x: x[1], reverse=True)
            
            # حذف فایل‌های اضافی
            if len(backup_files) > self.max_local_backups:
                for filepath, _ in backup_files[self.max_local_backups:]:
                    os.remove(filepath)
                    print(f"🗑️ فایل قدیمی حذف شد: {os.path.basename(filepath)}")
            
        except Exception as e:
            print(f"❌ خطا در پاک‌سازی: {str(e)}")

    def run_backup(self):
        """اجرای کامل فرآیند backup"""
        print(f"\n🔄 شروع فرآیند backup - {datetime.now().strftime('%Y/%m/%d %H:%M:%S')}")
        
        # ایجاد backup
        backup_path = self.create_database_backup()
        if not backup_path:
            return False
        
        # ایجاد metadata
        metadata_path = self.create_metadata_file(backup_path)
        
        # فشرده‌سازی
        zip_path = self.compress_backup(backup_path, metadata_path)
        
        # ارسال به ایمیل و GitHub (در صورت فعال بودن)
        email_success = self.send_email_backup(zip_path)
        github_success = self.upload_to_github(zip_path)
        
        # پاک‌سازی فایل‌های قدیمی
        self.cleanup_old_backups()
        
        print(f"✅ فرآیند backup تکمیل شد:")
        print(f"   📧 ایمیل: {'موفق' if email_success else 'ناموفق'}")
        print(f"   🐙 GitHub: {'موفق' if github_success else 'ناموفق'}")
        print(f"   💾 محلی: موفق")
        
        return True

    def schedule_backups(self):
        """زمان‌بندی backup های خودکار"""
        daily_time = os.getenv('BACKUP_DAILY_TIME', '02:00')
        weekly_time = os.getenv('BACKUP_WEEKLY_TIME', '03:00')
        schedule.every().day.at(daily_time).do(self.run_backup)
        schedule.every().sunday.at(weekly_time).do(self.run_backup)

        print("📅 زمان‌بندی backup ها:")
        print(f"   🌅 روزانه: ساعت {daily_time}")
        print(f"   📅 هفتگی: یکشنبه ساعت {weekly_time}")

def main():
    """تابع اصلی"""
    print("🔐 سیستم پشتیبان‌گیری خودکار - علیرضا حامد")
    print("=" * 50)
    
    backup_system = PharmacyBackupSystem()
    
    # اجرای backup فوری (برای تست)
    if len(os.sys.argv) > 1 and os.sys.argv[1] == '--now':
        backup_system.run_backup()
        return
    
    # زمان‌بندی backup ها
    backup_system.schedule_backups()
    
    print("🚀 سیستم backup فعال شد...")
    print("💡 برای backup فوری: python backup_system.py --now")
    print("⏹️ برای توقف: Ctrl+C")
    
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # بررسی هر دقیقه
    except KeyboardInterrupt:
        print("\n⏹️ سیستم backup متوقف شد")

if __name__ == "__main__":
    main()