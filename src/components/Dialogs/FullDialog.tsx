import {
  Dialog,
  DialogContent,
  DialogContentProps,
  DialogTitle,
  Divider,
  makeStyles,
} from '@material-ui/core';
import React from 'react';
import { X } from 'react-feather';
import DefaultIconButton from '../Buttons/DefaultIconButton';

interface Props {
  title: string;
  onClose: () => void;
  nonCloseable?: boolean;
  dialogContentProps?: DialogContentProps;
  children?: React.ReactChild;
}

export const FullDialog = (props: Props) => {
  const classes = useStyles();

  return (
    <Dialog
      onClose={props.onClose}
      open={true}
      fullWidth
      maxWidth='md'
      disableBackdropClick={props.nonCloseable}
      disableEscapeKeyDown={props.nonCloseable}
    >
      <DialogTitle className={classes.titleContainer}>
        {props.title}
        <div className={classes.closeButtonContainer}>
          <DefaultIconButton icon={X} onClick={props.onClose} />
        </div>
      </DialogTitle>

      <Divider />

      <DialogContent className={classes.contentContainer} {...props.dialogContentProps}>
        {props.children}
      </DialogContent>
    </Dialog>
  );
};

const useStyles = makeStyles({
  titleContainer: {
    padding: 16,
    position: 'relative',
  },

  closeButtonContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  contentContainer: {
    padding: 16,
  },
});

export default FullDialog;
