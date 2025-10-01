import React, { useState } from 'react'
import {
  Box,
  Card,
  CardMedia,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Fab,
  Zoom,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material'

/**
 * کامپوننت نمایش و بزرگنمایی تصاویر
 * قابلیت‌ها: zoom، rotate، fullscreen، download
 */
const ImageViewer = ({ 
  src, 
  alt = "تصویر", 
  width = 200, 
  height = 200,
  showControls = true,
  borderRadius = 2,
  onImageClick = null 
}) => {
  const [open, setOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick()
    } else {
      setOpen(true)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setZoom(1)
    setRotation(0)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleRotateLeft = () => {
    setRotation(prev => prev - 90)
  }

  const handleRotateRight = () => {
    setRotation(prev => prev + 90)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = src
    link.download = alt || 'image'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      const element = document.querySelector('.image-dialog')
      if (element?.requestFullscreen) {
        element.requestFullscreen()
      }
    }
  }

  if (!src) {
    return (
      <Card 
        sx={{ 
          width, 
          height, 
          borderRadius,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'grey.100',
          border: '2px dashed',
          borderColor: 'grey.300'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          بدون تصویر
        </Typography>
      </Card>
    )
  }

  return (
    <>
      {/* تصویر کوچک */}
      <Card 
        sx={{ 
          width, 
          height, 
          borderRadius,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: theme.shadows[8]
          }
        }}
        onClick={handleImageClick}
      >
        <CardMedia
          component="img"
          image={src}
          alt={alt}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        {showControls && (
          <Fab
            size="small"
            color="primary"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              opacity: 0.8,
              '&:hover': { opacity: 1 }
            }}
          >
            <ZoomInIcon />
          </Fab>
        )}
      </Card>

      {/* دیالوگ بزرگنمایی */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        fullScreen={isMobile}
        className="image-dialog"
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)'
        }}>
          <Typography variant="h6" color="white">
            {alt}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* کنترل‌های zoom */}
            <IconButton 
              onClick={handleZoomOut} 
              disabled={zoom <= 0.5}
              sx={{ color: 'white' }}
            >
              <ZoomOutIcon />
            </IconButton>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'white', 
                alignSelf: 'center',
                minWidth: 50,
                textAlign: 'center'
              }}
            >
              {Math.round(zoom * 100)}%
            </Typography>
            <IconButton 
              onClick={handleZoomIn} 
              disabled={zoom >= 3}
              sx={{ color: 'white' }}
            >
              <ZoomInIcon />
            </IconButton>
            
            {/* کنترل‌های rotate */}
            <IconButton onClick={handleRotateLeft} sx={{ color: 'white' }}>
              <RotateLeftIcon />
            </IconButton>
            <IconButton onClick={handleRotateRight} sx={{ color: 'white' }}>
              <RotateRightIcon />
            </IconButton>
            
            {/* دانلود */}
            <IconButton onClick={handleDownload} sx={{ color: 'white' }}>
              <DownloadIcon />
            </IconButton>
            
            {/* تمام صفحه */}
            <IconButton onClick={handleFullscreen} sx={{ color: 'white' }}>
              <FullscreenIcon />
            </IconButton>
            
            {/* بستن */}
            <IconButton onClick={handleClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ 
          padding: 0, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: 'rgba(0, 0, 0, 0.9)'
        }}>
          <Box
            component="img"
            src={src}
            alt={alt}
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease',
              cursor: zoom > 1 ? 'grab' : 'default',
              '&:active': {
                cursor: zoom > 1 ? 'grabbing' : 'default'
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ImageViewer