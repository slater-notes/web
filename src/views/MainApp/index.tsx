import React from 'react';
import { useStoreActions, useStoreState } from '../../stores/mainStore/typedHooks';
import { Redirect } from 'wouter';
import { Drawer, Grid, makeStyles } from '@material-ui/core';
import Sidebar from './Sidebar';
import Note from './Note';
import MiniSidebar from './Sidebar/MiniSidebar';
import defaultUserSettings from '../../stores/mainStore/defaultUserSettings';

const MainApp = () => {
  const classes = useStyles();

  const [isMobile, setIsMobile] = React.useState(false);

  const user = useStoreState((s) => s.user);
  const passwordKey = useStoreState((s) => s.passwordKey);
  const fileCollection = useStoreState((s) => s.fileCollection);
  const sidebarOpen = useStoreState((s) => s.sidebarOpen);
  const mySettings = useStoreState((s) => s.settings);
  const activeNote = useStoreState((s) => s.activeNote);

  const setSidebarOpen = useStoreActions((a) => a.setSidebarOpen);

  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1280) {
        // mdDown
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    onResize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  if (!user || !passwordKey || !fileCollection) {
    return <Redirect to='/login' />;
  }

  const getDrawerVariant = () => {
    if (isMobile) {
      return 'temporary';
    } else {
      return mySettings?.alwaysShowSidebar !== undefined
        ? mySettings?.alwaysShowSidebar
          ? 'permanent'
          : 'temporary'
        : defaultUserSettings.alwaysShowSidebar
        ? 'permanent'
        : 'temporary';
    }
  };

  return (
    <Grid container className={classes.container}>
      <div>
        <MiniSidebar />

        <Drawer
          className={classes.drawer}
          variant={getDrawerVariant()}
          open={getDrawerVariant() === 'temporary' ? (activeNote ? sidebarOpen : true) : undefined}
          onClose={() => setSidebarOpen(false)}
        >
          <Sidebar />
        </Drawer>
      </div>

      <div
        className={classes.content}
        style={{
          marginLeft: (!isMobile && sidebarOpen) || getDrawerVariant() === 'permanent' ? 700 : 80,
        }}
        onFocus={() => setSidebarOpen(false)}
      >
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
