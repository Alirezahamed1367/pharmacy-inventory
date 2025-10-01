# راهنمای انتشار روی Vercel

## گام ۱: ثبت‌نام در Vercel
1. به [vercel.com](https://vercel.com) بروید
2. با GitHub ثبت‌نام کنید

## گام ۲: آپلود پروژه به GitHub
1. اگر پروژه روی GitHub نیست، ابتدا یک repository بسازید
2. کدهای پروژه را push کنید

## گام ۳: Deploy از GitHub
1. در Vercel روی "New Project" کلیک کنید
2. Repository پروژه را انتخاب کنید
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. روی "Deploy" کلیک کنید

## گام ۴: تنظیم Environment Variables
1. در پنل پروژه Vercel، به "Settings" > "Environment Variables" بروید
2. این متغیرها را اضافه کنید:
   - `VITE_SUPABASE_URL`: URL پروژه Supabase
   - `VITE_SUPABASE_ANON_KEY`: anon key پروژه Supabase

## گام ۵: دوباره Deploy کردن
پس از اضافه کردن environment variables، دوباره deploy کنید

## آدرس نهایی
پروژه شما در آدرسی مثل `https://your-project.vercel.app` در دسترس خواهد بود