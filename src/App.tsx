import { createMuiTheme, LinearProgress, ThemeProvider } from '@material-ui/core';
import { createStore, StoreProvider } from 'easy-peasy';
import React, { useEffect } from 'react';
import MainStore from './stores/mainStore';
import Login from './views/Login';
import { Route } from 'wouter';
import MainApp from './views/MainApp';
import { useStoreActions, useStoreState } from './stores/mainStore/typedHooks';
import { localDB } from '@slater-notes/core';
import Signup from './views/Signup';
import { THEME } from './config/theme';
import loadAppSettings from './services/local/loadAppSettings';
// eslint-disable-next-line import/no-webpack-loader-syntax
import createWorker from 'workerize-loader!./services/webWorkers';
import * as Workers from './services/webWorkers';

const mainStore = createStore(MainStore);
const theme = createMuiTheme(THEME);

export const AppStarter = ({ children }: any) => {
  const db = useStoreState((s) => s.localDB);
  const appSettings = useStoreState((s) => s.appSettings);

  const setLocalDB = useStoreActions((a) => a.setLocalDB);
  const setWorkers = useStoreActions((a) => a.setWorkers);
  const setAppSettings = useStoreActions((a) => a.setAppSettings);

  useEffect(() => {
    const initWorkers = createWorker<typeof Workers>();
    setWorkers(initWorkers);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!appSettings && db) {
      (async () => {
        const load = await loadAppSettings(db);
        setAppSettings(load.appSettings);
      })();
    }
    // eslint-disable-next-line
  }, [db]);

  useEffect(() => {
    if (!db) {
      setLocalDB(new localDB());
    }
    // eslint-disable-next-line
  }, []);

  if (!db || !appSettings) {
    return <LinearProgress />;
  } else {
    return children;
  }
};

const App = () => {
  return (
    <StoreProvider store={mainStore}>
      <ThemeProvider theme={theme}>
        <AppStarter>
          <Route path='/login' component={Login} />
          <Route path='/new' component={Signup} />
          <Route component={MainApp} />
        </AppStarter>
      </ThemeProvider>
    </StoreProvider>
  );
};

export default App;
