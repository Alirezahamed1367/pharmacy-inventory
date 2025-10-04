import React, { useState, useRef } from 'react'
import {
  Box,
  Button,
  LinearProgress,
  Typography,
  Alert,
  IconButton,
  Card,
  CardContent,
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from '@mui/icons-material'
import { uploadImage } from '../services/supabase'
import ImageViewer from './ImageViewer'
import { guardOffline, buildUserError } from '../utils/errorUtils'

/**
 * کامپوننت آپلود تصویر با پیش‌نمایش
 */
const ImageUpload = ({ 
  value = null, 
  onChange, 
  label = "آپلود تصویر",
  accept = "image/*",
  maxSize = 1, // MB (raw file max before compression attempt)
  bucket = "drug-images",
  targetMaxKB = 300, // هدف نهایی حجم پس از فشرده‌سازی
  maxWidth = 800,
  maxHeight = 800
}) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [info, setInfo] = useState(null)
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('فایل انتخابی تصویر نیست')
    }
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      throw new Error(`حجم فایل نباید بیشتر از ${maxSize} مگابایت باشد`)
    }
    return true
  }

  // فشرده‌سازی تصویر (تبدیل به WebP) با کنترل کیفیت تا رسیدن به حجم هدف
  const compressImage = async (file) => {
    // در صورت GIF متحرک یا فرمت غیر قابل پردازش، بدون تغییر برگردان
    if (file.type === 'image/gif') return file

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          let { width, height } = img

          // مقیاس‌کردن در صورت بزرگ‌تر بودن از حد مجاز
          const scale = Math.min(1, maxWidth / width, maxHeight / height)
          if (scale < 1) {
            width = Math.floor(width * scale)
            height = Math.floor(height * scale)
          }

            canvas.width = width
            canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          let quality = 0.85
          const mime = 'image/webp'
          let blob = canvas.toDataURL(mime, quality)

          // تکرار کاهش کیفیت تا رسیدن به حجم هدف یا حداقل کیفیت
          const dataURLToBlob = (dataUrl) => {
            const arr = dataUrl.split(',')
            const mimeMatch = arr[0].match(/:(.*?);/)
            const mimeType = mimeMatch ? mimeMatch[1] : 'image/webp'
            const bstr = atob(arr[1])
            let n = bstr.length
            const u8arr = new Uint8Array(n)
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n)
            }
            return new Blob([u8arr], { type: mimeType })
          }

          let blobObj = dataURLToBlob(blob)
          while ((blobObj.size / 1024) > targetMaxKB && quality > 0.4) {
            quality -= 0.1
            blob = canvas.toDataURL(mime, quality)
            blobObj = dataURLToBlob(blob)
          }

          // ساخت File جدید برای حفظ نام با پسوند webp
            const newFileName = file.name.replace(/\.[^.]+$/, '') + '.webp'
          const compressedFile = new File([blobObj], newFileName, { type: 'image/webp' })
          resolve({ compressedFile, originalSize: file.size, finalSize: compressedFile.size, scaled: scale < 1 })
        } catch (e) {
          reject(e)
        }
      }
      img.onerror = () => reject(new Error('عدم امکان خواندن تصویر'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = async (event) => {
    const offline = guardOffline('در حالت آفلاین امکان آپلود تصویر نیست')
    if (offline.blocked) {
      setError(offline.message)
      event.target.value = ''
      return
    }
    const file = event.target.files[0]
    if (!file) return

    try {
      // پاک کردن خطای قبلی بلافاصله پس از انتخاب فایل جدید
      if (error) setError(null)
      validateFile(file)
      setError(null)
      setInfo(null)
      setUploading(true)
      setProgress(0)

      // شبیه‌سازی پیشرفت اولیه (پردازش + آپلود)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval)
            return 80
          }
          return prev + 8
        })
      }, 180)

      // فشرده‌سازی
      const { compressedFile, originalSize, finalSize, scaled } = await compressImage(file)

      // ادامه نوار پیشرفت تا قبل از پایان
      setProgress(90)

      const result = await uploadImage(compressedFile, bucket)

      clearInterval(progressInterval)
      setProgress(100)

      if (result.error) {
        throw new Error(result.error.message)
      }

      onChange(result.data.url)

      setInfo({
        originalKB: (originalSize / 1024).toFixed(1),
        finalKB: (finalSize / 1024).toFixed(1),
        scaled,
        ratio: ((finalSize / originalSize) * 100).toFixed(0)
      })

      setTimeout(() => setProgress(0), 1200)
    } catch (err) {
      setError(buildUserError(err))
      setProgress(0)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleRemove = () => {
    onChange(null)
    setError(null)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Box>
      {/* فیلد مخفی آپلود */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* نمایش تصویر موجود */}
      {value && (
        <Box sx={{ mb: 2, position: 'relative', display: 'inline-block' }}>
          <ImageViewer 
            src={value} 
            alt="تصویر آپلود شده"
            width={200}
            height={200}
          />
          <IconButton
            onClick={handleRemove}
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              backgroundColor: 'error.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'error.dark'
              }
            }}
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* دکمه آپلود */}
      {!value && (
        <Card 
            sx={{ 
            border: '2px dashed',
            borderColor: uploading ? 'primary.main' : 'grey.300',
            backgroundColor: uploading ? 'primary.50' : 'grey.50',
            cursor: uploading ? 'default' : 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': uploading ? {} : {
              borderColor: 'primary.main',
              backgroundColor: 'primary.50'
            }
          }}
            // حذف onClick سطح Card برای جلوگیری از باز شدن دوباره دیالوگ
        >
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <ImageIcon 
              sx={{ 
                fontSize: 48, 
                color: uploading ? 'primary.main' : 'grey.400',
                mb: 2 
              }} 
            />
            <Typography variant="h6" gutterBottom>
              {uploading ? 'در حال آپلود...' : label}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              فرمت‌های مجاز: همه تصاویر (حداکثر {maxSize}MB)
            </Typography>
            {!uploading && (
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={handleButtonClick}
              >
                انتخاب فایل
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* نوار پیشرفت */}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            آپلود: {progress}%
          </Typography>
        </Box>
      )}

      {/* نمایش پیام‌ها */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {!error && info && (
        <Alert severity="success" sx={{ mt: 2, direction: 'ltr' }}>
          <Typography variant="body2" component="div">
            Optimized: {info.originalKB}KB → {info.finalKB}KB ({info.ratio}%) {info.scaled ? ' | resized' : ''}
          </Typography>
        </Alert>
      )}

      {/* دکمه تغییر تصویر */}
      {value && !uploading && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={handleButtonClick}
            fullWidth
          >
            تغییر تصویر
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default ImageUpload