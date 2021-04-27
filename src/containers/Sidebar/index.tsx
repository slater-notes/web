import { Grid, makeStyles } from '@material-ui/core';
import Files from './Files';
import Folders from './Folders';

const Sidebar = () => {
  const classes = useStyles();

  return (
    <Grid container className={classes.container}>
      <Grid item className={`${classes.gridItem} ${classes.foldersContainer}`}>
        <Folders />
      </Grid>
      <Grid item className={`${classes.gridItem} ${classes.filesContainer}`}>
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

  gridItem: {
    height: '100vh',
    display: 'flex',
  },

  foldersContainer: {
    width: 300,
    borderRight: `1px solid ${theme.palette.divider}`,
  },

  filesContainer: {
    flex: 1,
  },
}));

export default Sidebar;
