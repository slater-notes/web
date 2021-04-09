import { Grid, makeStyles } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import React from 'react';
import Files from './Files';
import Folders from './Folders';

const Sidebar = () => {
  const classes = useStyles();

  return (
    <Grid container className={classes.container}>
      <Grid item className={classes.gridItems} style={{ width: 300 }}>
        <Folders />
      </Grid>
      <Grid item className={classes.gridItems} style={{ flex: 1, borderColor: grey[100] }}>
        <Files />
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'relative',
    width: 700,
  },

  gridItems: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'stretch',
    alignItems: 'stretch',
    borderRight: `1px solid ${theme.palette.divider}`,

    '& > *': {
      width: '100%',
    },
  },
}));

export default Sidebar;
