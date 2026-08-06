import { createTheme, type PaletteMode } from '@mui/material';
import type {} from '@mui/x-data-grid/themeAugmentation';

// Decanterr brand palette
const TEAL_MAIN   = '#14b8a6'; // teal-500
const TEAL_DARK   = '#0d9488'; // teal-600
const TEAL_LIGHT  = '#5eead4'; // teal-300
const AMBER_MAIN  = '#f59e0b'; // amber-400
const AMBER_DARK  = '#d97706'; // amber-500
const NAVY_BG     = '#0c1a2e'; // deep navy
const NAVY_PAPER  = '#112240'; // slightly lighter navy
const NAVY_BORDER = '#1e3a5f';

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: {
        main:          isDark ? TEAL_MAIN  : TEAL_DARK,
        light:         TEAL_LIGHT,
        dark:          TEAL_DARK,
        contrastText:  isDark ? '#0c1a2e' : '#ffffff',
      },
      secondary: {
        main:         AMBER_MAIN,
        light:        '#fcd34d',
        dark:         AMBER_DARK,
        contrastText: '#000000',
      },
      ...(isDark
        ? {
            background: {
              default: NAVY_BG,
              paper:   NAVY_PAPER,
            },
            divider: NAVY_BORDER,
          }
        : {
            background: {
              default: '#f0fdfa',
              paper:   '#ffffff',
            },
            divider: '#cce8e5',
          }),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700, letterSpacing: '-0.5px' },
      h5: { fontWeight: 700, letterSpacing: '-0.5px' },
      h6: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            background: isDark
              ? 'linear-gradient(90deg, #081322 0%, #0c1a2e 100%)'
              : 'linear-gradient(90deg, #0d9488 0%, #14b8a6 100%)',
            borderBottom: `1px solid ${isDark ? NAVY_BORDER : 'rgba(0,0,0,0.08)'}`,
            boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.12)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            width: 240,
            background: isDark ? '#091220' : '#f0fdfa',
            borderRight: `1px solid ${isDark ? NAVY_BORDER : '#b2dfdb'}`,
          },
        },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: {
            borderColor: isDark ? NAVY_BORDER : '#c8e6e2',
            boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 8px',
            width: 'calc(100% - 16px)',
            '& .MuiListItemIcon-root': {
              color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
            },
            '&:hover': {
              backgroundColor: isDark ? 'rgba(20,184,166,0.08)' : 'rgba(13,148,136,0.06)',
            },
            '&.Mui-selected': {
              backgroundColor: isDark ? 'rgba(20,184,166,0.15)' : 'rgba(13,148,136,0.12)',
              color: isDark ? TEAL_LIGHT : TEAL_DARK,
              '& .MuiListItemIcon-root': {
                color: isDark ? TEAL_LIGHT : TEAL_DARK,
              },
              '&:hover': {
                backgroundColor: isDark ? 'rgba(20,184,166,0.22)' : 'rgba(13,148,136,0.18)',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500 },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            borderColor: isDark ? NAVY_BORDER : '#c8e6e2',
            backgroundColor: isDark ? NAVY_PAPER : '#ffffff',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#dff5f0',
              borderBottomColor: isDark ? NAVY_BORDER : '#b2dfdb',
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: isDark ? 'transparent' : '#dff5f0',
            },
            '& .MuiDataGrid-filler': {
              backgroundColor: isDark ? 'transparent' : '#dff5f0',
            },
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: isDark ? NAVY_PAPER : '#ffffff',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: isDark ? 'rgba(20,184,166,0.06)' : 'rgba(13,148,136,0.05)',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTopColor: isDark ? NAVY_BORDER : '#c8e6e2',
              backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f0faf8',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: isDark
              ? '0 2px 8px rgba(0,0,0,0.4)'
              : '0 1px 4px rgba(0,0,0,0.08)',
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            ...(isDark ? {} : {
              backgroundColor: '#ffffff',
            }),
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            borderColor: isDark ? NAVY_BORDER : '#b2dfdb',
          },
        },
      },
    },
  });
}
