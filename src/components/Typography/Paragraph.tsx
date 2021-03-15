import { Box } from '@material-ui/core';
import React from 'react';

interface Props {
  children?: React.ReactNode;
}

const Paragraph = (props: Props) => {
  return (
    <Box component='p' color='text.primary'>
      {props.children}
    </Box>
  );
};

export default Paragraph;
