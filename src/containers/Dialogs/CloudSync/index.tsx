import { List, ListItem, ListItemText, makeStyles, TextField, useTheme } from '@material-ui/core';
import moment from 'moment';
import DefaultButton from '../../../components/Buttons/DefaultButton';
import DefaultDialog from '../../../components/Dialogs/DefaultDialog';
import { defaultCloudSyncURL } from '../../../config/cloudSync';
import { useStoreState } from '../../../store/typedHooks';
import { useEffect, useState, Fragment } from 'react';
import useFullSync from '../../../hooks/useFullSync';
import useCloudSyncRegister from '../../../hooks/useCloudSyncRegister';

const CloudSync = () => {
  const theme = useTheme();
  const classes = useStyles();

  const [passPrompt, setPassPrompt] = useState(false);
  const [plainTextPassword, setPlainTextPassword] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState({ fromNow: '', exact: '' });

  const [startSync, isSyncing, syncError, syncComplete, resetSync] = useFullSync();
  const [
    startRegister,
    isRegistering,
    registerError,
    registerComplete,
    resetRegister,
  ] = useCloudSyncRegister();

  const user = useStoreState((s) => s.user);

  const doSync = async () => {
    if (!user) {
      console.error('No user object in store.');
      return;
    }

    const { cloudSyncSessionToken } = user;

    if (!cloudSyncSessionToken) {
      /**
       * If we get here, this means the user has not yet registered to
       * the cloud sync server. It's possible that the user is registered,
       * and may have manually removed their `cloudSyncPasswordKey`.
       * In that case, just "try" to register them in anyway. It shall
       * result with a "username already taken" error.
       */

      if (!plainTextPassword) {
        setPassPrompt(true);
        return;
      }

      startRegister(plainTextPassword);
      return;
    }

    setPlainTextPassword(null);
    startSync();
  };

  const resetAll = () => {
    setPassPrompt(false);
    setPlainTextPassword(null);
    resetSync();
    resetRegister();
  };

  const updateLastSyncTime = () => {
    if (!user) return;

    const { cloudLastSynced } = user;

    if (typeof cloudLastSynced === 'number') {
      setLastSyncTime({
        fromNow: moment.unix(cloudLastSynced).fromNow(),
        exact: moment.unix(cloudLastSynced).format('D MMM YYYY HH:mm'),
      });
    }
  };

  /**
   * This effect detects when we finish registering.
   * Re-run doSync() again.
   */
  useEffect(() => {
    if (registerComplete) doSync();
  }, [registerComplete]);

  /**
   * This effect detects when we finish syncing.
   * Run updateLastSyncTime().
   */
  useEffect(() => {
    if (syncComplete) updateLastSyncTime();
  }, [syncComplete]);

  useEffect(() => {
    updateLastSyncTime();
    const interval = setInterval(updateLastSyncTime, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={classes.content}>
      <List>
        <ListItem>
          <ListItemText primary='Cloud Sync Server URL' secondary={defaultCloudSyncURL} />
        </ListItem>
        <ListItem>
          <ListItemText
            secondaryTypographyProps={{ component: 'div' }}
            secondary={
              <Fragment>
                <DefaultButton
                  text='Start Sync'
                  isLoading={isSyncing || isRegistering}
                  buttonProps={{
                    variant: 'contained',
                    color: 'secondary',
                    disabled: isSyncing || isRegistering,
                    onClick: doSync,
                  }}
                />
                {(isSyncing || isRegistering) && (
                  <span style={{ marginLeft: theme.spacing(2) }}>
                    Syncing your account... Do not close this window.
                  </span>
                )}
              </Fragment>
            }
          />
        </ListItem>
        {typeof user?.cloudLastSynced === 'number' && (
          <ListItem>
            <ListItemText
              primary='Last Full Sync'
              secondary={`${lastSyncTime.fromNow} — ${lastSyncTime.exact}`}
            />
          </ListItem>
        )}
      </List>

      {passPrompt && (
        <DefaultDialog
          title='Enter your Password'
          text={
            <Fragment>
              <div style={{ marginBottom: theme.spacing(2) }}>
                To start cloud sync, enter your account password.
              </div>
              <div>
                <TextField
                  name='password'
                  type='password'
                  label='Password'
                  variant='standard'
                  fullWidth
                  autoFocus
                  onChange={(e) => setPlainTextPassword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setPassPrompt(false);
                      doSync();
                    }
                  }}
                />
              </div>
            </Fragment>
          }
          withCancel
          withConfirm
          autoFocusCancelButton={false}
          confirmLabel='Start Sync'
          confirmButtonColor='secondary'
          onCancel={resetAll}
          onConfirm={() => {
            setPassPrompt(false);
            doSync();
          }}
        />
      )}

      {(syncError || registerError) && (
        <DefaultDialog
          title='Error'
          text={
            registerError?.error === 'username already exist' ? (
              <Fragment>
                <p>
                  The username <b>{user?.username}</b> is already in use at{' '}
                  <b>{defaultCloudSyncURL}</b>.
                </p>
                <p>
                  You can change your username under <b>Settings &gt; Account</b>.
                </p>
              </Fragment>
            ) : (
              <p>An error occured: {syncError?.error || registerError?.error}</p>
            )
          }
          withCancel
          autoFocusCancelButton
          cancelLabel='Close'
          onCancel={resetAll}
        />
      )}

      {syncComplete && (
        <DefaultDialog
          title='All Synced'
          text={`Your account and notes have been synced to ${defaultCloudSyncURL}`}
          withCancel
          autoFocusCancelButton
          cancelLabel='Close'
          onCancel={resetAll}
        />
      )}
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(2),
  },
}));

export default CloudSync;
