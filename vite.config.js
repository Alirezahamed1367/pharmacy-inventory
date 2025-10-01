import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // بهینه‌سازی برای تولید
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          // جدا کردن vendor dependencies
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    // کاهش اندازه bundle
    chunkSizeWarningLimit: 1000
  },

  // تنظیمات development
  server: {
    port: 5173,
    open: true,
    host: true
  },

  // تنظیمات preview
  preview: {
    port: 4173,
    host: true
  },

  // Environment variables
  define: {
    // دسترسی به متغیرهای محیطی در کد
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  }
})
