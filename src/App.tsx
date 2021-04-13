import { createMuiTheme, LinearProgress, ThemeProvider } from '@material-ui/core';
import { createStore, StoreProvider } from 'easy-peasy';
import { useEffect } from 'react';
import ApplicationStore from './store';
import Login from './pages/Login';
import { Route } from 'wouter';
import MainApp from './pages/MainApp';
import { useStoreActions, useStoreState } from './store/typedHooks';
import { localDB } from '@slater-notes/core';
import Signup from './pages/Signup';
import { THEME } from './config/theme';
import loadAppSettings from './services/loadAppSettings';
// eslint-disable-next-line import/no-webpack-loader-syntax
import createWorker from 'workerize-loader!./webWorkers';
import * as Workers from './webWorkers';

const store = createStore(ApplicationStore);
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
        const appSettings = await loadAppSettings(db);
        setAppSettings(appSettings);
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
    <StoreProvider store={store}>
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
