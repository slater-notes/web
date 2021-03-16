import { List, ListItem, ListItemText, makeStyles, TextField, useTheme } from '@material-ui/core';
import moment from 'moment';
import React from 'react';
import DefaultButton from '../../../components/Buttons/DefaultButton';
import DefaultDialog from '../../../components/Dialogs/DefaultDialog';
import { defaultCloudSyncURL } from '../../../config/cloudSync';
import getNewSessionFromCloudSync from '../../../services/cloudSync/api/getNewSession';
import uploadNotesToCloudSync from '../../../services/cloudSync/uploadNotes';
import { useStoreActions, useStoreState } from '../../../stores/mainStore/typedHooks';
import generateTokenFromPassword from '../../../utils/generateTokenFromPassword';
import checkSessionFromCloudSync from '../../../services/cloudSync/api/checkSession';
import prepareAndRegisterToCloudSync from '../../../services/cloudSync/prepareAndRegister';
import syncAccountAndNotesToCloudSync from '../../../services/cloudSync/syncAccountAndNotes';
import verifyPassword from '../../../services/local/verifyPassword';
import generateCloudSyncPasswordKey from '../../../services/local/generateCloudSyncPasswordKey';

const CloudSync = () => {
  const theme = useTheme();
  const classes = useStyles();

  const [passPrompt, setPassPrompt] = React.useState(false);
  const [password, setPassword] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [usernameTakenError, setUsernameTakenError] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncSuccess, setSyncSuccess] = React.useState(false);
  const [lastSyncTime, setLastSyncTime] = React.useState({ fromNow: '', exact: '' });

  const localDB = useStoreState((s) => s.localDB);
  const workers = useStoreState((s) => s.workers);
  const user = useStoreState((s) => s.user);
  const fileCollection = useStoreState((s) => s.fileCollection);
  const passwordKey = useStoreState((s) => s.passwordKey);
  let cloudSyncPasswordKey = useStoreState((s) => s.cloudSyncPasswordKey);

  const updateUser = useStoreActions((a) => a.updateUser);
  const setCloudSyncPasswordKey = useStoreActions((a) => a.setCloudSyncPasswordKey);
  const updateFileCollection = useStoreActions((a) => a.updateFileCollection);

  const doSync = async () => {
    if (!workers || !user || !fileCollection || !passwordKey) {
      console.log({ workers, user, fileCollection, passwordKey });
      setError('unknown error');
      return;
    }

    if (!cloudSyncPasswordKey) {
      if (!password) {
        setPassPrompt(true);
        return;
      } else {
        cloudSyncPasswordKey = await generateCloudSyncPasswordKey({
          username: user?.username,
          password,
        });
        setCloudSyncPasswordKey(cloudSyncPasswordKey);
      }
    }

    if (user?.cloudSyncSessionToken) {
      setIsSyncing(true);

      const sessionCheck = await checkSessionFromCloudSync({
        username: user.username,
        sessionToken: user.cloudSyncSessionToken,
      });

      if (sessionCheck.success) {
        // do sync account data and notes
        const syncAccount = await syncAccountAndNotesToCloudSync({
          sessionToken: user.cloudSyncSessionToken,
          user,
          fileCollection,
          fileCollectionNonce: user.fileCollectionNonce,
          passwordKey,
          cloudSyncPasswordKey,
        });

        if (syncAccount.fileCollection) {
          await updateFileCollection(syncAccount.fileCollection);
        }

        if (syncAccount.error) {
          setError(syncAccount.error);
        } else {
          setSyncSuccess(true);
          updateUser({
            userItem: { ...user, cloudLastSynced: moment().unix() },
            noCloudSync: true,
          });
        }

        setIsSyncing(false);
        return;
      }
    }

    // Clear session token
    if (user?.cloudSyncSessionToken) {
      delete user.cloudSyncSessionToken;
      await updateUser({ userItem: { ...user }, noCloudSync: true });
    }

    doFirstTimeSync();
  };

  const doFirstTimeSync = async () => {
    if (!localDB || !workers || !user || !fileCollection || !passwordKey || !cloudSyncPasswordKey) {
      // TODO: log this?
      console.log({ localDB, workers, user, fileCollection, passwordKey, cloudSyncPasswordKey });
      setError('unknown error');
      return;
    }

    if (!password) {
      setPassPrompt(true);
      return;
    }

    setIsSyncing(true);

    const token = await generateTokenFromPassword(password, user.username);

    if (typeof password === 'string') {
      setPassword(null);
    }

    // verify password
    const verify = await verifyPassword(localDB, { username: user.username, password });

    if (!verify.success) {
      setIsSyncing(false);
      setError('invalid password');
      return;
    }

    let sessionToken: string | null;

    if (typeof user.cloudLastSynced === 'undefined') {
      // register to cloud sync
      console.log('register to cloud sync');
      const register = await prepareAndRegisterToCloudSync({
        user,
        token,
        db: localDB,
        cloudSyncPasswordKey,
      });

      console.log(register);

      if (register.error || !register.sessionToken) {
        setIsSyncing(false);

        if (register.error === 'username already exist') {
          setUsernameTakenError(true);
        } else {
          setError(register.error || 'unknown error');
        }

        return;
      }

      sessionToken = register.sessionToken;

      // upload all notes
      console.log('upload all notes');
      await uploadNotesToCloudSync({
        username: user.username,
        sessionToken,
        db: localDB,
        noteIds: fileCollection.notes.map((n) => n.id),
      });
    } else {
      if (!user.cloudSyncSessionToken) {
        // if user does not have a session token, get from cloud sync
        console.log('get session token from cloud sync');
        const newSession = await getNewSessionFromCloudSync({ username: user.username, token });

        if (newSession.error || !newSession.sessionToken) {
          setIsSyncing(false);
          setError(newSession.error || 'unknown error');
          return;
        }

        sessionToken = newSession.sessionToken;
      } else {
        sessionToken = user.cloudSyncSessionToken;
      }

      // sync account
      console.log('sync account');
      const syncAccount = await syncAccountAndNotesToCloudSync({
        sessionToken,
        user,
        fileCollection,
        fileCollectionNonce: user.fileCollectionNonce,
        passwordKey,
        cloudSyncPasswordKey,
      });

      if (syncAccount.fileCollection) {
        await updateFileCollection(syncAccount.fileCollection);
      }

      if (syncAccount.error) {
        setIsSyncing(false);
        setError(syncAccount.error);
        return;
      }
    }

    updateUser({
      userItem: {
        ...user,
        cloudSyncSessionToken: sessionToken,
        cloudLastSynced: moment().unix(),
      },
      noCloudSync: true,
    });

    setIsSyncing(false);
    setSyncSuccess(true);

    console.log('all done!');
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (typeof user?.cloudLastSynced === 'number') {
        setLastSyncTime({
          fromNow: moment.unix(user.cloudLastSynced).fromNow(),
          exact: moment.unix(user.cloudLastSynced).format('D MMM YYYY HH:mm'),
        });
      }
    }, 10000);

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
              <React.Fragment>
                <DefaultButton
                  text='Start Sync'
                  isLoading={isSyncing}
                  buttonProps={{
                    variant: 'contained',
                    color: 'secondary',
                    disabled: isSyncing,
                    onClick: doSync,
                  }}
                />
                {isSyncing && (
                  <span style={{ marginLeft: theme.spacing(2) }}>
                    Syncing your account... Do not close this window.
                  </span>
                )}
              </React.Fragment>
            }
          />
        </ListItem>
        {typeof user?.cloudLastSynced === 'number' && (
          <ListItem>
            <ListItemText
              primary='Last Synced'
              secondary={`${lastSyncTime.fromNow} — ${lastSyncTime.exact}`}
            />
          </ListItem>
        )}
      </List>

      {passPrompt && (
        <DefaultDialog
          title='Enter your Password'
          text={
            <React.Fragment>
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
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setPassPrompt(false);
                      doSync();
                    }
                  }}
                />
              </div>
            </React.Fragment>
          }
          withCancel
          withConfirm
          autoFocusCancelButton={false}
          confirmLabel='Start Sync'
          confirmButtonColor='secondary'
          onCancel={() => {
            setPassPrompt(false);
            setPassword(null);
          }}
          onConfirm={() => {
            setPassPrompt(false);
            doSync();
          }}
        />
      )}

      {typeof error === 'string' && (
        <DefaultDialog
          title='Error'
          text={`An error occured: ${error}`}
          withCancel
          autoFocusCancelButton
          cancelLabel='Close'
          onCancel={() => setError(null)}
        />
      )}

      {usernameTakenError && (
        <DefaultDialog
          title='Username Taken'
          text={
            <React.Fragment>
              <p>
                The username <b>{user?.username}</b> is already in use at{' '}
                <b>{defaultCloudSyncURL}</b>.
              </p>
              <p>
                You can change your username under <b>Settings &gt; Account</b>.
              </p>
            </React.Fragment>
          }
          withCancel
          autoFocusCancelButton
          cancelLabel='Close'
          onCancel={() => setUsernameTakenError(false)}
        />
      )}

      {syncSuccess && (
        <DefaultDialog
          title='All Synced'
          text={`Your account and notes have been synced to ${defaultCloudSyncURL}`}
          withCancel
          autoFocusCancelButton
          cancelLabel='Close'
          onCancel={() => setSyncSuccess(false)}
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
