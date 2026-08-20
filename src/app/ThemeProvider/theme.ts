import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: '#171717',
      contrastText: '#fafafa',
    },
    secondary: {
      main: '#f5f5f5',
      contrastText: '#171717',
    },
    error: {
      main: '#dc2626',
      contrastText: '#fafafa',
    },
    warning: {
      main: '#ca8a04',
      contrastText: '#422006',
    },
    info: {
      main: '#171717',
      contrastText: '#fafafa',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#171717',
      secondary: '#737373',
    },
    divider: '#e5e5e5',
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
  },
});
