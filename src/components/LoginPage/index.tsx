import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';

interface Props {
  background?: number;
  children?: React.ReactNode;
}

const LoginPage = (props: Props) => {
  const classes = useStyles();

  return (
    <Grid container spacing={0} alignItems='stretch' className={classes.container}>
      <Grid item xs={12} className={classes.leftContainer}>
        <div className={classes.logoContainer}>
          <img src='/logo250.png' alt='Slater Notes Logo' width={30} />
        </div>

        {props.children}
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    height: '100vh',
  },

  leftContainer: {
    height: '100vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',

    '& > *': {
      padding: `${theme.spacing(4)}px ${theme.spacing(8)}px`,
      width: '100%',
      maxWidth: 600,
      margin: '0 auto',
    },
  },

  logoContainer: {
    textAlign: 'center',
  },
}));

export default LoginPage;
