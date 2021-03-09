import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles,
  useTheme,
} from '@material-ui/core';
import DefaultButton from '../Buttons/DefaultButton';

const useStyles = makeStyles(() => ({
  title: {
    fontWeight: 400,
    fontSize: '1rem',
  },
}));

interface Props {
  title: string;
  text?: React.ReactNode;
  withCancel?: boolean;
  cancelLabel?: string;
  autoFocusCancelButton?: boolean; // true by default
  cancelButtonDisabled?: boolean;
  onCancel?: () => void;
  withConfirm?: boolean;
  confirmButtonColor?: 'primary' | 'secondary';
  confirmButtonStyle?: React.CSSProperties;
  confirmButtonDisabled?: boolean;
  confirmButtonIsLoading?: boolean;
  onConfirm?: () => void;
  confirmLabel?: string;
  nonCloseable?: boolean;
}

const DefaultDialog = (props: Props) => {
  const theme = useTheme();
  const classes = useStyles();

  return (
    <Dialog
      open={true}
      onClose={props.withCancel ? props.onCancel : undefined}
      disableBackdropClick={props.nonCloseable}
      disableEscapeKeyDown={props.nonCloseable}
    >
      <DialogTitle className={classes.title} disableTypography>
        {props.title}
      </DialogTitle>

      {props.text && (
        <DialogContent>
          <DialogContentText component='div'>{props.text}</DialogContentText>
        </DialogContent>
      )}

      <DialogActions>
        {props.withCancel && (
          <Button
            onClick={props.onCancel}
            disabled={props.cancelButtonDisabled}
            autoFocus={
              typeof props.autoFocusCancelButton === undefined ? true : props.autoFocusCancelButton
            }
            style={{ color: theme.palette.text.secondary }}
          >
            {props.cancelLabel || 'Cancel'}
          </Button>
        )}
        {props.withConfirm && (
          <DefaultButton
            text={props.confirmLabel || 'Confirm'}
            isLoading={props.confirmButtonIsLoading}
            buttonProps={{
              color: props.confirmButtonColor || 'primary',
              disabled: props.confirmButtonDisabled,
              style: props.confirmButtonStyle,
              onClick: props.onConfirm,
            }}
          />
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DefaultDialog;
