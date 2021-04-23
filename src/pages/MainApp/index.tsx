import { useStoreActions, useStoreState } from '../../store/typedHooks';
import { Drawer, Grid, LinearProgress, makeStyles } from '@material-ui/core';
import Sidebar from '../../containers/Sidebar';
import Note from '../../containers/Note';

const MainApp = () => {
  const classes = useStyles();

  const user = useStoreState((s) => s.user);
  const passwordKey = useStoreState((s) => s.passwordKey);
  const fileCollection = useStoreState((s) => s.fileCollection);
  const sidebarOpen = useStoreState((s) => s.sidebarOpen);
  const activeNote = useStoreState((s) => s.activeNote);

  const setSidebarOpen = useStoreActions((a) => a.setSidebarOpen);

  if (!user || !passwordKey || !fileCollection) {
    return <LinearProgress />;
  }

  return (
    <Grid container className={classes.container}>
      <div>
        <Drawer
          className={classes.drawer}
          variant={'temporary'}
          open={activeNote ? sidebarOpen : true}
          onClose={() => setSidebarOpen(false)}
        >
          <Sidebar />
        </Drawer>
      </div>

      <div className={classes.content} onFocus={() => setSidebarOpen(false)}>
        <Note />
      </div>
    </Grid>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    background: theme.palette.background.default,
    height: '100vh',
  },

  drawer: {
    '& .MuiDrawer-paper': {
      border: 0,
    },
  },

  content: {
    flex: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

export default MainApp;
