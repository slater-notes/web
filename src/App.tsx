import { createMuiTheme, LinearProgress, ThemeProvider } from '@material-ui/core';
import { createStore, StoreProvider } from 'easy-peasy';
import { lazy, memo, Suspense, useEffect } from 'react';
import ApplicationStore from './store';
import { Route, Switch, useLocation, useRoute } from 'wouter';
import { useStoreActions } from './store/typedHooks';
import { THEME } from './config/theme';
import loadAppSettings from './services/loadAppSettings';

const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const MainApp = lazy(() => import('./pages/MainApp'));

const store = createStore(ApplicationStore);
const theme = createMuiTheme(THEME);

export const AppStarter = memo(({ children }: any) => {
  const [, setLocation] = useLocation();
  const [isRoot] = useRoute('/');
  const setAppSettings = useStoreActions((a) => a.setAppSettings);

  useEffect(() => {
    (async () => {
      setAppSettings(await loadAppSettings());
    })();

    if (isRoot) {
      setLocation('/login');
      return;
    }

    // eslint-disable-next-line
  }, []);

  return children;
});

const App = () => {
  return (
    <StoreProvider store={store}>
      <ThemeProvider theme={theme}>
        <AppStarter>
          <Suspense fallback={<LinearProgress />}>
            <Switch>
              <Route path='/login' component={Login} />
              <Route path='/new' component={Signup} />
              <Route component={MainApp} />
            </Switch>
          </Suspense>
        </AppStarter>
      </ThemeProvider>
    </StoreProvider>
  );
};

export default App;
