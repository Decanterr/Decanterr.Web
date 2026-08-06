import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Tooltip,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  LibraryBooks as LibraryIcon,
  Queue as QueueIcon,
  People as AccountsIcon,
  Settings as SettingsIcon,
  Delete as TrashIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Sync as SyncIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../contexts/ThemeContext';
import { useBookStats } from '../api/hooks/useBooks';
import { useScanStatus } from '../api/hooks/useLibrary';
import { useSignalRStatus } from '../hooks/useSignalRStatus';

const drawerWidth = 240;

const navItems = [
  { label: 'Library', path: '/', icon: <LibraryIcon /> },
  { label: 'Queue', path: '/queue', icon: <QueueIcon /> },
  { label: 'Accounts', path: '/accounts', icon: <AccountsIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
  { label: 'Trash Bin', path: '/trash', icon: <TrashIcon /> },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: stats } = useBookStats();
  const { data: scanStatus } = useScanStatus();
  const signalRState = useSignalRStatus();

  const drawer = (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ px: 2, py: 1.5, mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          component="img"
          src="/favicon.svg"
          alt="Decanterr"
          sx={{ width: 32, height: 32, borderRadius: '7px', flexShrink: 0 }}
        />
        <Typography variant="h6" noWrap sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
          Decanterr
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <Box
              component="img"
              src="/favicon.svg"
              alt="Decanterr"
              sx={{ width: 28, height: 28, borderRadius: '6px', flexShrink: 0 }}
            />
            <Typography variant="h6" noWrap sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
              Decanterr
            </Typography>
          </Box>

          {scanStatus?.scanning && (
            <Chip
              icon={<SyncIcon sx={{ animation: 'spin 1s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />}
              label="Scanning..."
              size="small"
              sx={{ mr: 1, borderColor: 'rgba(255,255,255,0.55)', color: 'rgba(255,255,255,0.9)', '& .MuiChip-icon': { color: 'rgba(255,255,255,0.9)' } }}
              variant="outlined"
            />
          )}

          {stats && (
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, mr: 2, alignItems: 'center' }}>
              <Chip
                label={`${stats.totalBooks} books`}
                size="small"
                variant="outlined"
                sx={{ borderColor: 'rgba(255,255,255,0.55)', color: 'rgba(255,255,255,0.9)' }}
              />
              <Chip
                label={`${stats.liberated} unlocked`}
                size="small"
                variant="outlined"
                sx={{ borderColor: 'rgba(255,255,255,0.55)', color: 'rgba(255,255,255,0.9)' }}
              />
              {stats.notLiberated > 0 && (
                <Chip
                  label={`${stats.notLiberated} locked`}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: 'rgba(255,255,255,0.55)', color: 'rgba(255,255,255,0.9)' }}
                />
              )}
              {stats.inError > 0 && (
                <Chip
                  label={`${stats.inError} errors`}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: 'rgba(255,255,255,0.7)', color: '#fff', fontWeight: 600 }}
                />
              )}
            </Box>
          )}

          <Tooltip title={signalRState === 'Connected' ? 'Real-time connected' : 'Real-time disconnected'}>
            <IconButton color="inherit" size="small" sx={{ mr: 1 }}>
              {signalRState === 'Connected' ? <CloudDoneIcon /> : <CloudOffIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          {drawer}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
