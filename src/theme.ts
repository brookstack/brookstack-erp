import { createTheme, alpha } from '@mui/material/styles';

const PRIMARY_ORANGE = '#b52841'; // Your new primary color
const SUCCESS_GREEN = '#2e7d32'; // Afrinet green for "Approved/Save"
const BACKGROUND_LIGHT = '#f9fafb';

export const theme = createTheme({
  palette: {
    primary: { 
      main: PRIMARY_ORANGE,
      light: alpha(PRIMARY_ORANGE, 0.1),
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
    fontFamily: '"Inter", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    // Buttons: Pill-shaped and using the new Primary color
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          backgroundColor: PRIMARY_ORANGE,
          '&:hover': { backgroundColor: '#96350b' }, // Darker shade for hover
        },
      },
    },
    // Sidebar active state using your new Primary color
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: alpha(PRIMARY_ORANGE, 0.08),
            color: PRIMARY_ORANGE,
            '& .MuiListItemIcon-root': { color: PRIMARY_ORANGE },
          },
          '&:hover': {
            backgroundColor: alpha(PRIMARY_ORANGE, 0.04),
          },
        },
      },
    },
    // Inputs: Focus ring now matches your Primary color
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: PRIMARY_ORANGE,
            boxShadow: `0 0 0 4px ${alpha(PRIMARY_ORANGE, 0.1)}`,
          },
        },
      },
    },
  },
});