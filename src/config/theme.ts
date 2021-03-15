import { ThemeOptions } from '@material-ui/core';
import { deepOrange, grey } from '@material-ui/core/colors';

export const THEME: ThemeOptions = {
  palette: {
    type: 'light',
    primary: {
      main: grey[900],
    },
    secondary: {
      main: deepOrange[400],
      contrastText: '#fff',
    },
    background: {
      default: '#fff',
      paper: grey[50],
    },
    divider: grey[200],
  },
  typography: {
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    fontFamily: ['Inter', 'sans-serif'].join(','),
  },
};
