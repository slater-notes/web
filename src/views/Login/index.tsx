import {
  Checkbox,
  FormControlLabel,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
import DefaultButton from '../../components/Buttons/DefaultButton';
import { useStoreActions, useStoreState } from '../../stores/mainStore/typedHooks';
import { Redirect } from 'wouter';
import loadUser from '../../services/local/loadUser';
import LoginPage from '../../components/LoginPage';
import { Cloud, CloudOff } from 'react-feather';
import getNewSessionFromCloudSync from '../../services/cloudSync/api/getNewSession';
import generateTokenFromPassword from '../../utils/generateTokenFromPassword';
import getAccountFromCloudSync from '../../services/cloudSync/api/getAccount';
import decryptAndSaveUserFromBase64 from '../../services/local/decryptAndSaveUserFromBase64';
import saveFileCollectionFromBase64 from '../../services/local/saveFileCollectionFromBase64';
import moment from 'moment';
import downloadNotesFromCloudSync from '../../services/cloudSync/downloadNotes';
import H1 from '../../components/Typography/H1';
import Paragraph from '../../components/Typography/Paragraph';

const Login = () => {
  const classes = useStyles();

  const localDB = useStoreState((s) => s.localDB);
  const user = useStoreState((s) => s.user);
  const passwordKey = useStoreState((s) => s.passwordKey);
  const fileCollection = useStoreState((s) => s.fileCollection);
  const appSettings = useStoreState((s) => s.appSettings);

  const setUser = useStoreActions((a) => a.setUser);
  const setPasswordKey = useStoreActions((a) => a.setPasswordKey);
  const setCloudSyncPasswordKey = useStoreActions((a) => a.setCloudSyncPasswordKey);
  const setFileCollection = useStoreActions((a) => a.setFileCollection);
  const setSettings = useStoreActions((a) => a.setSettings);
  const updateAppSettings = useStoreActions((a) => a.updateAppSettings);
  const setActiveFolderId = useStoreActions((a) => a.setActiveFolderId);

  if (user && passwordKey && fileCollection) {
    return <Redirect to='/' />;
  }

  return (
    <LoginPage background={0}>
      <div>
        <H1>Log In</H1>
        <Paragraph>Enter your username and password to access your notes.</Paragraph>
      </div>

      <div className={classes.formContainer}>
        <Formik
          initialValues={{
            username: '',
            password: '',
            enableCloudSyncLogin: !!appSettings?.enableCloudSyncLogin,
          }}
          validationSchema={() =>
            yup.object().shape({
              username: yup.string().trim(),
              password: yup.string(),
              enableCloudSyncLogin: yup.boolean(),
            })
          }
          onSubmit={(values, { setErrors, setSubmitting }) => {
            (async () => {
              if (!localDB) {
                setErrors({ username: 'unknown error' });
                setSubmitting(false);
                return;
              }

              updateAppSettings({
                ...appSettings,
                enableCloudSyncLogin: values.enableCloudSyncLogin,
              });

              let sessionToken: string | undefined;

              if (values.enableCloudSyncLogin) {
                // verify account and get new sessionToken
                const token = await generateTokenFromPassword(values.password, values.username);

                const newSession = await getNewSessionFromCloudSync({
                  username: values.username,
                  token,
                });

                switch (newSession.error) {
                  case 'user does not exist':
                    setErrors({ username: 'username does not exist' });
                    setSubmitting(false);
                    return;
                  case 'token does not match':
                    setErrors({ password: 'password is incorrect' });
                    setSubmitting(false);
                    return;
                  default:
                    if (!newSession.sessionToken) {
                      setErrors({ username: newSession.error || 'unknown error' });
                      setSubmitting(false);
                      return;
                    }
                }

                sessionToken = newSession.sessionToken;
              }

              let loadLocalUser = await loadUser(localDB, {
                username: values.username,
                password: values.password,
              });

              if (loadLocalUser.error?.code === 'no_user' && typeof sessionToken === 'string') {
                // download data
                const getAccount = await getAccountFromCloudSync({
                  username: values.username,
                  sessionToken,
                });

                if (!getAccount.userItem || !getAccount.fileCollection) {
                  setErrors({ username: getAccount.error || 'unknown error' });
                  setSubmitting(false);
                  return;
                }

                const saveUser = await decryptAndSaveUserFromBase64(
                  localDB,
                  values.username,
                  values.password,
                  getAccount.userItem,
                );

                if (!saveUser.userItem) {
                  setErrors({ username: saveUser.error?.message || 'unknown error' });
                  setSubmitting(false);
                  return;
                }

                // save fileCollection
                await saveFileCollectionFromBase64(
                  localDB,
                  saveUser.userItem,
                  getAccount.fileCollection,
                );

                // try loadUser again
                loadLocalUser = await loadUser(localDB, {
                  username: values.username,
                  password: values.password,
                });

                // download notes
                if (loadLocalUser.fileCollection) {
                  await downloadNotesFromCloudSync({
                    username: values.username,
                    sessionToken,
                    db: localDB,
                    noteIds: loadLocalUser.fileCollection.notes.map((n) => n.id),
                  });
                }
              }

              setSubmitting(false);

              switch (loadLocalUser.error?.code) {
                case 'no_user':
                  return setErrors({ username: loadLocalUser.error.message });
                case 'bad_key':
                  return setErrors({ password: 'Password does not match.' });
                default:
                  if (
                    loadLocalUser.error ||
                    !loadLocalUser.user ||
                    !loadLocalUser.passwordKey ||
                    !loadLocalUser.cloudSyncPasswordKey ||
                    !loadLocalUser.fileCollection
                  ) {
                    console.log(loadLocalUser);
                    setErrors({ username: loadLocalUser.error?.message || 'unknown error' });
                    return;
                  }
              }

              if (sessionToken) {
                loadLocalUser.user.cloudSyncSessionToken = sessionToken;
                loadLocalUser.user.cloudLastSynced = moment().unix();
              }

              // display Favorites folder if there is one or more note in there
              if (loadLocalUser.fileCollection.notes.findIndex((n) => n.isStarred) > -1) {
                setActiveFolderId('starred');
              }

              setSettings(loadLocalUser.settings || null);
              setCloudSyncPasswordKey(loadLocalUser.cloudSyncPasswordKey);

              setUser(loadLocalUser.user);
              setPasswordKey(loadLocalUser.passwordKey);
              setFileCollection(loadLocalUser.fileCollection);
            })();
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
            <React.Fragment>
              <form onSubmit={handleSubmit} autoComplete='off'>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='enableCloudSyncLogin'
                      icon={<CloudOff />}
                      checkedIcon={<Cloud />}
                      checked={values.enableCloudSyncLogin}
                      onChange={handleChange}
                    />
                  }
                  label={
                    <Typography color='textSecondary'>
                      {values.enableCloudSyncLogin ? 'Log in to cloud sync account' : 'Offline'}
                    </Typography>
                  }
                />

                <TextField
                  name='username'
                  label='Username'
                  variant='outlined'
                  fullWidth
                  autoFocus
                  value={values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.username && !!errors.username}
                  helperText={
                    touched.username &&
                    errors.username &&
                    errors.username.charAt(0).toUpperCase() + errors.username.slice(1)
                  }
                />
                <TextField
                  type='password'
                  name='password'
                  label='Password'
                  variant='outlined'
                  fullWidth
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && !!errors.password}
                  helperText={
                    touched.password &&
                    errors.password &&
                    errors.password.charAt(0).toUpperCase() + errors.password.slice(1)
                  }
                />

                <DefaultButton
                  buttonProps={{
                    type: 'submit',
                    variant: 'contained',
                    size: 'large',
                    color: 'primary',
                    fullWidth: true,
                    disabled: isSubmitting,
                  }}
                  text='Login'
                  isLoading={isSubmitting}
                />
              </form>
            </React.Fragment>
          )}
        </Formik>
      </div>

      <DefaultButton
        buttonProps={{
          color: 'primary',
          fullWidth: true,
          href: '/new',
        }}
        text='Create Account'
      />
    </LoginPage>
  );
};

const useStyles = makeStyles({
  formContainer: {
    width: '100%',

    '& form > *': {
      marginBottom: '1rem',
    },
  },
});

export default Login;
