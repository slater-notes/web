import { LinearProgress, ThemeProvider } from '@material-ui/core';
import { createStore, StoreProvider } from 'easy-peasy';
import { lazy, memo, Suspense, useEffect } from 'react';
import ApplicationStore from './store';
import { Route, Switch, useLocation, useRoute } from 'wouter';
import { useStoreActions } from './store/typedHooks';
import { defaultTheme } from './config/theme';
import getAppSettingsFromDisk from './services/getAppSettingsFromDisk';

const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const MainApp = lazy(() => import('./pages/MainApp'));

const store = createStore(ApplicationStore);

export const AppStarter = memo(({ children }: any) => {
  const [, setLocation] = useLocation();
  const [isRoot] = useRoute('/');
  const setAppSettings = useStoreActions((a) => a.setAppSettings);

  useEffect(() => {
    (async () => {
      setAppSettings(await getAppSettingsFromDisk());
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
      <ThemeProvider theme={defaultTheme}>
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
