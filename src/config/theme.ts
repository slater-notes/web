import { createMuiTheme } from '@material-ui/core';
import { deepOrange, grey } from '@material-ui/core/colors';
import { PaletteOptions } from '@material-ui/core/styles/createPalette';
import { SpacingOptions } from '@material-ui/core/styles/createSpacing';
import { TypographyOptions } from '@material-ui/core/styles/createTypography';
import { Shape } from '@material-ui/core/styles/shape';

const palette: PaletteOptions = {
  type: 'light',
  primary: {
    main: grey[900],
  },
  secondary: {
    main: deepOrange[400],
    contrastText: '#fff',
  },
  text: {
    primary: grey[900],
    secondary: '#707684',
  },
  background: {
    default: '#fff',
    paper: '#fff',
  },
  divider: grey[200],
};

const typography: TypographyOptions = {
  fontSize: 14,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  fontFamily: ['Inter', 'sans-serif'].join(','),
};

const shape: Shape = {
  borderRadius: 5,
};

const spacing: SpacingOptions = (factor: number) => 8 * factor;

export const defaultTheme = createMuiTheme({
  palette,
  typography,
  shape,
  spacing,
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
    MuiListItemText: {
      secondaryTypographyProps: {
        component: 'div' as any,
      },
    },
  },
  overrides: {
    MuiChip: {
      root: {
        backgroundColor: 'transparent',
        borderRadius: shape.borderRadius,
        border: `1px solid ${palette.divider}`,
        padding: spacing(1),
        height: 'auto',
        '&:hover': {
          borderColor: grey[300],
        },
      },
      clickable: {
        '&:hover, &:focus': {
          backgroundColor: 'transparent',
        },
      },
      deletable: {
        '&:focus': {
          backgroundColor: 'transparent',
        },
      },
      label: {
        paddingLeft: spacing(1),
        paddingRight: spacing(1),
        fontSize: '0.9rem',
        fontWeight: typography.fontWeightMedium,
      },
    },
    MuiMenu: {
      list: {
        padding: spacing(1),
        minWidth: 150,
      },
    },
    MuiMenuItem: {
      root: {
        fontWeight: typography.fontWeightMedium,
        padding: spacing(1),
        borderRadius: shape.borderRadius,
        selected: {
          backgroundColor: grey[200],
        },
        '&:hover': {
          backgroundColor: grey[100],
        },
      },
    },
  },
});
