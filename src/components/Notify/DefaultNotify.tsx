import { IconButton, Snackbar } from '@material-ui/core';
import React from 'react';
import { X } from 'react-feather';

interface Props {
  message: string;
  isOpen: boolean;
  handleClose: () => void;
  addButtons?: React.ReactNode[];
}

const DefaultNotify = (props: Props) => {
  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      open={props.isOpen}
      autoHideDuration={3000}
      onClose={props.handleClose}
      message={props.message}
      action={
        <React.Fragment>
          {props.addButtons && props.addButtons.map((Button) => Button)}
          {/* <Button color='secondary' size='small' onClick={() => {}}>
            UNDO
          </Button> */}
          <IconButton size='small' aria-label='close' color='inherit' onClick={props.handleClose}>
            <X size={16} />
          </IconButton>
        </React.Fragment>
      }
    ></Snackbar>
  );
};

export default DefaultNotify;
