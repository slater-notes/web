import { makeStyles } from '@material-ui/core';
import grey from '@material-ui/core/colors/grey';
import { PropsWithChildren } from 'react';

const NotifBox = ({ children }: PropsWithChildren<{}>) => {
  const classes = useStyles();

  return <div className={classes.container}>{children}</div>;
};

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: grey[800],
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(2),
    margin: `0 -${theme.spacing(2)}px`,
    borderRadius: theme.shape.borderRadius,
  },
}));

export default NotifBox;
