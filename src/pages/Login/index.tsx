import { Checkbox, FormControlLabel, makeStyles, TextField, Typography } from '@material-ui/core';
import React from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
import DefaultButton from '../../components/Buttons/DefaultButton';
import { useStoreActions, useStoreState } from '../../store/typedHooks';
import { Redirect } from 'wouter';
import loadUser from '../../services/loadUser';
import LoginPage from '../../components/LoginPage';
import { Cloud, CloudOff } from 'react-feather';
import getNewSessionFromCloudSync from '../../api/cloudSync/getNewSession';
import generateTokenFromPassword from '../../utils/generateTokenFromPassword';
import getAccountFromCloudSync from '../../api/cloudSync/getAccount';
import decryptAndSaveUserFromBase64 from '../../services/decryptAndSaveUserFromBase64';
import saveFileCollectionFromBase64 from '../../services/saveFileCollectionFromBase64';
import moment from 'moment';
import downloadNotesFromCloudSync from '../../services/downloadNotesFromCloudSync';
import H1 from '../../components/Typography/H1';
import Paragraph from '../../components/Typography/Paragraph';

const Login = () => {
  const classes = useStyles();

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

                if ('error' in newSession) {
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
                      setErrors({ username: newSession.error });
                      setSubmitting(false);
                      return;
                  }
                }

                sessionToken = newSession.sessionToken;
              }

              let loadLocalUser = await loadUser({
                username: values.username,
                password: values.password,
              });

              if (
                'error' in loadLocalUser &&
                loadLocalUser.errorCode === 'no_user' &&
                typeof sessionToken === 'string'
              ) {
                // download data
                const getAccount = await getAccountFromCloudSync({
                  username: values.username,
                  sessionToken,
                });

                if ('error' in getAccount) {
                  setErrors({ username: getAccount.error });
                  setSubmitting(false);
                  return;
                }

                const saveUser = await decryptAndSaveUserFromBase64(
                  values.username,
                  values.password,
                  getAccount.userItem,
                );

                if ('error' in saveUser) {
                  setErrors({ username: saveUser.error });
                  setSubmitting(false);
                  return;
                }

                // save fileCollection
                await saveFileCollectionFromBase64(saveUser.userItem, getAccount.fileCollection);

                // try loadUser again
                loadLocalUser = await loadUser({
                  username: values.username,
                  password: values.password,
                });

                // download notes
                if ('success' in loadLocalUser) {
                  await downloadNotesFromCloudSync({
                    username: values.username,
                    sessionToken,
                    noteIds: loadLocalUser.fileCollection.notes.map((n) => n.id),
                  });
                }
              }

              setSubmitting(false);

              if ('error' in loadLocalUser) {
                switch (loadLocalUser.errorCode) {
                  case 'no_user':
                    return setErrors({ username: loadLocalUser.error });
                  case 'bad_key':
                    return setErrors({ password: 'Password does not match.' });
                  default:
                    console.log(loadLocalUser);
                    setErrors({ username: loadLocalUser.error });
                    return;
                }
              }

              if (sessionToken) {
                loadLocalUser.user.cloudSyncSessionToken = sessionToken;
                loadLocalUser.user.cloudLastSynced = moment().unix();
              }

              // display Favorites folder if there is one or more note in there
              if (
                loadLocalUser.fileCollection.notes.findIndex((n) => n.isStarred && !n.isDeleted) >
                -1
              ) {
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
                  type='text'
                  name='username'
                  label='Username'
                  variant='outlined'
                  fullWidth
                  autoFocus
                  autoComplete='username'
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
                  autoComplete='current-password'
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
