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

/**
 * کامپوننت آپلود تصویر با پیش‌نمایش
 */
const ImageUpload = ({ 
  value = null, 
  onChange, 
  label = "آپلود تصویر",
  accept = "image/*",
  maxSize = 5, // MB
  bucket = "drug-images"
}) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    // بررسی نوع فایل
    if (!file.type.startsWith('image/')) {
      throw new Error('فقط فایل‌های تصویری مجاز هستند')
    }

    // بررسی حجم فایل
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      throw new Error(`حجم فایل نباید بیشتر از ${maxSize} مگابایت باشد`)
    }

    return true
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      validateFile(file)
      setError(null)
      setUploading(true)
      setProgress(0)

      // شبیه‌سازی پیشرفت آپلود
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // آپلود فایل
      const result = await uploadImage(file, bucket)
      
      clearInterval(progressInterval)
      setProgress(100)

      if (result.error) {
        throw new Error(result.error.message)
      }

      // ارسال URL به کامپوننت والد
      onChange(result.data.url)
      
      setTimeout(() => {
        setProgress(0)
      }, 1000)

    } catch (err) {
      setError(err.message)
      setProgress(0)
    } finally {
      setUploading(false)
      // پاک کردن input برای امکان انتخاب مجدد همان فایل
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
          onClick={uploading ? undefined : handleButtonClick}
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
              فایل‌های مجاز: JPG, PNG, GIF (حداکثر {maxSize}MB)
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

      {/* نمایش خطا */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
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