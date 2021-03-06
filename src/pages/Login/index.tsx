import {
  Box,
  Checkbox,
  FormControlLabel,
  makeStyles,
  Typography,
  useTheme,
} from '@material-ui/core';
import { useFormik } from 'formik';
import * as yup from 'yup';
import DefaultButton from '../../components/Buttons/DefaultButton';
import { useStoreActions, useStoreState } from '../../store/typedHooks';
import { useLocation } from 'wouter';
import getDecryptedAccountFromDisk from '../../services/getDecryptedAccountFromDisk';
import LoginPage from '../../components/LoginPage';
import { Cloud, CloudOff } from 'react-feather';
import H1 from '../../components/Typography/H1';
import Paragraph from '../../components/Typography/Paragraph';
import useCloudSyncLogin from '../../hooks/useCloudSyncLogin';
import { useEffect, useState } from 'react';
import { ErrorOrNull } from '../../hooks/useLoading';
import { defer, upperFirst } from 'lodash';
import SingleLineInput from '../../components/Input/SingleLineInput';

type FormFields = {
  username: string;
  password: string;
};

const Login = () => {
  const theme = useTheme();
  const classes = useStyles();

  const [generalError, setGeneralError] = useState<ErrorOrNull>(null);

  const [, setLocation] = useLocation();
  const cloudSyncLogin = useCloudSyncLogin();

  const appSettings = useStoreState((s) => s.appSettings);

  const setUser = useStoreActions((a) => a.setUser);
  const setPasswordKey = useStoreActions((a) => a.setPasswordKey);
  const setCloudSyncPasswordKey = useStoreActions((a) => a.setCloudSyncPasswordKey);
  const setFileCollection = useStoreActions((a) => a.setFileCollection);
  const setSettings = useStoreActions((a) => a.setSettings);
  const updateAppSettings = useStoreActions((a) => a.updateAppSettings);

  const reset = () => {
    setGeneralError(null);
    formik.setSubmitting(false);
    cloudSyncLogin.reset();
  };

  const offlineLogin = async () => {
    const { username, password } = formik.values;

    formik.setSubmitting(true);

    const loadUser = await getDecryptedAccountFromDisk({ username, password });

    if ('error' in loadUser) {
      switch (loadUser.errorCode) {
        case 'no_user':
          formik.setErrors({ username: noUserError });
          break;
        case 'bad_key':
          formik.setErrors({ password: wrongPasswordError });
          break;
        default:
          setGeneralError(loadUser);
      }

      formik.setSubmitting(false);
      return;
    }

    setUser(loadUser.user);
    setPasswordKey(loadUser.passwordKey);
    setFileCollection(loadUser.fileCollection);
    setSettings(loadUser.settings || null);
    setCloudSyncPasswordKey(loadUser.cloudSyncPasswordKey);

    setLocation('/');
  };

  const formik = useFormik<FormFields>({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: () =>
      yup.object().shape({
        username: yup.string().trim().required(),
        password: yup.string().required(),
      }),
    onSubmit: ({ username, password }) => {
      reset();

      if (appSettings?.enableCloudSyncLogin) cloudSyncLogin.start({ username, password });
      else offlineLogin();
    },
  });

  useEffect(() => {
    if (cloudSyncLogin.isComplete) defer(() => setLocation('/'));
  }, [cloudSyncLogin.isComplete]);

  useEffect(() => {
    if (cloudSyncLogin.error) {
      switch (cloudSyncLogin.error.errorCode) {
        case 'no_user':
          formik.setErrors({ username: noUserError });
          return;
        case 'wrong_password':
          formik.setErrors({ password: wrongPasswordError });
          return;
      }
    }

    setGeneralError(cloudSyncLogin.error);
  }, [cloudSyncLogin.error]);

  return (
    <LoginPage background={0}>
      <div>
        <H1>Log In</H1>
        <Paragraph>Enter your username and password to access your notes.</Paragraph>
      </div>

      <div className={classes.formContainer}>
        <form onSubmit={formik.handleSubmit}>
          <FormControlLabel
            control={
              <Checkbox
                name='enableCloudSyncLogin'
                icon={<CloudOff />}
                checkedIcon={<Cloud />}
                checked={!!appSettings?.enableCloudSyncLogin}
                onChange={(_e, checked) => {
                  updateAppSettings({
                    ...appSettings,
                    enableCloudSyncLogin: checked,
                  });
                }}
              />
            }
            label={
              <Typography color='textSecondary'>
                {appSettings?.enableCloudSyncLogin ? 'Log in to cloud sync account' : 'Offline'}
              </Typography>
            }
          />

          <SingleLineInput
            type='text'
            name='username'
            label='Username'
            variant='outlined'
            fullWidth
            autoFocus
            autoComplete='username'
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.username &&
              !!formik.errors.username &&
              formik.values.username.length > 0
            }
            helperText={
              formik.touched.username &&
              formik.errors.username &&
              formik.values.username.length > 0 &&
              upperFirst(formik.errors.username)
            }
          />
          <SingleLineInput
            type='password'
            name='password'
            label='Password'
            variant='outlined'
            fullWidth
            autoComplete='current-password'
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.password &&
              !!formik.errors.password &&
              formik.values.password.length > 0
            }
            helperText={
              formik.touched.password &&
              formik.errors.password &&
              formik.values.password.length > 0 &&
              upperFirst(formik.errors.password)
            }
          />

          {generalError && (
            <Box component='p' textAlign='center' color={theme.palette.error.main}>
              {upperFirst(generalError.error)}
            </Box>
          )}

          <DefaultButton
            buttonProps={{
              type: 'submit',
              variant: 'contained',
              size: 'large',
              color: 'primary',
              fullWidth: true,
              disabled: formik.isSubmitting || cloudSyncLogin.isLoading,
            }}
            text='Login'
            isLoading={formik.isSubmitting || cloudSyncLogin.isLoading}
          />
        </form>
      </div>

      <DefaultButton
        buttonProps={{
          color: 'primary',
          fullWidth: true,
          href: '/new',
          onClick: (e) => {
            e.preventDefault();
            setLocation('/new');
          },
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

const noUserError = 'Username does not exist';
const wrongPasswordError = 'Wrong password';

export default Login;
