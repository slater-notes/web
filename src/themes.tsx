import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';

export const defaultTheme = createMuiTheme({
  // props: {
  //   // Name of the component ⚛️
  //   MuiButtonBase: {
  //     // The default props to change
  //     disableRipple: true, // No more ripple, on the whole application 💣!
  //   },
  // },
});

export const ThemeDecorator = (props: { children: React.ReactNode }) => (
  <ThemeProvider theme={defaultTheme}>{props.children}</ThemeProvider>
);
