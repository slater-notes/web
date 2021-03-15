import { Box, useTheme } from '@material-ui/core';
import React from 'react';

interface Props {
  children?: React.ReactNode;
}

const H1 = (props: Props) => {
  const theme = useTheme();

  return (
    <Box
      component='h1'
      color='text.primary'
      fontSize='2.4rem'
      fontWeight={theme.typography.fontWeightBold}
      style={{ marginBottom: theme.spacing(2) }}
    >
      {props.children}
    </Box>
  );
};

export default H1;
