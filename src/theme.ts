import { createTheme, alpha } from '@mui/material/styles';

const PRIMARY_RUST = '#b52841'; 
const SUCCESS_GREEN = '#2e7d32'; 
const BACKGROUND_LIGHT = '#f9fafb';

// Global Font Definition
const SANS_STACK = 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
const MONO_STACK = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const theme = createTheme({
  palette: {
    primary: { 
      main: PRIMARY_RUST,
      light: alpha(PRIMARY_RUST, 0.1),
      contrastText: '#fff' 
    },
    success: { 
      main: SUCCESS_GREEN,
      contrastText: '#fff' 
    },
    background: { 
      default: BACKGROUND_LIGHT, 
      paper: '#ffffff' 
    },
    text: { 
      primary: '#111827', 
      secondary: '#6b7280' 
    },
  },
  typography: {
    // This sets the default font for all MUI Typography components
    fontFamily: SANS_STACK,
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 },
    button: { textTransform: 'none', fontWeight: 600 },
    caption: { fontWeight: 400 },
    overline: { fontWeight: 500 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');
        
        body {
          font-family: ${SANS_STACK};
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Ensures tables and all child elements inherit the font */
        table, th, td {
          font-family: ${SANS_STACK} !important;
        }

        code, pre {
          font-family: ${MONO_STACK} !important;
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontFamily: SANS_STACK,
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: SANS_STACK,
          fontSize: '0.875rem',
        },
        head: {
          fontWeight: 600,
          color: '#374151',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontFamily: SANS_STACK,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: PRIMARY_RUST,
            boxShadow: `0 0 0 4px ${alpha(PRIMARY_RUST, 0.1)}`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: SANS_STACK,
          fontWeight: 600,
        },
      },
    },
  },
});


