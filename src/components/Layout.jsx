import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Medication as MedicationIcon,
  Warehouse as WarehouseIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Inventory as InventoryIcon,
  AccountCircle,
  Logout,
  Lock,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { signOut } from '../services/supabase'
import ChangePassword from './ChangePassword'

const drawerWidth = 280

const menuItems = [
  { text: 'داشبورد', path: '/', icon: <DashboardIcon /> },
  { text: 'مدیریت داروها', path: '/drugs', icon: <MedicationIcon /> },
  { text: 'رسید کالا', path: '/receipts', icon: <InventoryIcon /> },
  { text: 'مدیریت انبارها', path: '/warehouses', icon: <WarehouseIcon /> },
  { text: 'گزارشات', path: '/reports', icon: <ReportsIcon /> },
  { text: 'تنظیمات', path: '/settings', icon: <SettingsIcon /> },
]

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()

  // دریافت اطلاعات کاربر فعلی
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleChangePasswordOpen = () => {
    setChangePasswordOpen(true)
    handleMenuClose()
  }

  const handleChangePasswordClose = () => {
    setChangePasswordOpen(false)
  }

  const handleLogout = async () => {
    localStorage.removeItem('user')
    window.location.reload()
    handleMenuClose()
  }

  const handleNavigate = (path) => {
    navigate(path)
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
          سیستم انبارداری دارو
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light + '20',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light + '30',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          طراحی و توسعه نرم‌افزار توسط علیرضا حامد
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          پاییز 1404
        </Typography>
      </Box>
    </div>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mr: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ ml: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            سیستم مدیریت انبار دارو
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuClick}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                {currentUser.name || currentUser.username}
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleChangePasswordOpen}>
                <ListItemIcon>
                  <Lock fontSize="small" />
                </ListItemIcon>
                تغییر رمز عبور
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                خروج از سیستم
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              display: 'flex',
              flexDirection: 'column',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar />
        {children}
      </Box>

      {/* دیالوگ تغییر رمز عبور */}
      <ChangePassword
        open={changePasswordOpen}
        onClose={handleChangePasswordClose}
        currentUser={currentUser}
      />
    </Box>
  )
}
