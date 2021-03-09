import { Button, ButtonProps, CircularProgress, makeStyles } from '@material-ui/core';
import React from 'react';

interface Props {
  text: string | React.ReactNode;
  type?: 'error';
  isLoading?: boolean;
  buttonProps?: ButtonProps;
}

const DefaultButton = (props: Props) => {
  const classes = useStyles();

  return (
    <div
      className={[
        classes.container,
        props.type ? classes[props.type] : '',
        props.buttonProps?.fullWidth ? 'full-width' : '',
      ].join(' ')}
    >
      <Button {...props.buttonProps}>{props.text}</Button>
      {props.isLoading && <CircularProgress size={24} className={classes.progress} />}
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'inline-block',
    position: 'relative',

    '&.full-width': {
      display: 'block',
    },
  },

  error: {
    color: theme.palette.error.main,
  },

  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}));

export default DefaultButton;
