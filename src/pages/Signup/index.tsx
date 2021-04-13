import {
  Accordion as MuiAccordion,
  AccordionDetails as MuiAccordionDetails,
  AccordionSummary as MuiAccordionSummary,
  Checkbox,
  Divider,
  FormControlLabel,
  makeStyles,
  TextField,
  Typography,
  withStyles,
} from '@material-ui/core';
import React from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
import DefaultButton from '../../components/Buttons/DefaultButton';
import { useStoreActions, useStoreState } from '../../store/typedHooks';
import { Redirect } from 'wouter';
import createNewUser from '../../services/local/createNewUser';
import LoginPage from '../../components/LoginPage';
import { ChevronDown } from 'react-feather';
import { generateSalt, getKeyFromDerivedPassword } from '@slater-notes/core';
import H1 from '../../components/Typography/H1';
import Paragraph from '../../components/Typography/Paragraph';
import prepareAndRegisterToCloudSync from '../../services/cloudSync/prepareAndRegister';
import generateTokenFromPassword from '../../utils/generateTokenFromPassword';
import moment from 'moment';

const Signup = () => {
  const classes = useStyles();

  const [done, setDone] = React.useState(false);
  const [testingIterations, setTestingIterations] = React.useState(false);
  const [iterationsResult, setIterationsResult] = React.useState<number | null>(null);

  const localDB = useStoreState((s) => s.localDB);

  const setUser = useStoreActions((a) => a.setUser);
  const setPasswordKey = useStoreActions((a) => a.setPasswordKey);
  const setFileCollection = useStoreActions((a) => a.setFileCollection);
  const updateUser = useStoreActions((a) => a.updateUser);
  const setCloudSyncPasswordKey = useStoreActions((a) => a.setCloudSyncPasswordKey);

  if (done) {
    return <Redirect to='/' />;
  }

  return (
    <LoginPage background={1}>
      <div>
        <H1>New Account</H1>
        <Paragraph>Enter a username and password to create a new account.</Paragraph>
      </div>

      <div className={classes.formContainer}>
        <Formik
          initialValues={{
            username: '',
            password: '',
            password2: '',
            enableCloudSync: true,
            iterations: 500000,
          }}
          validationSchema={() =>
            yup.object().shape({
              username: yup
                .string()
                .trim()
                .lowercase()
                .min(3)
                .matches(/^[a-z0-9]+$/, 'username must be alphanumeric')
                .required(),
              password: yup.string().min(8).required(),
              password2: yup
                .string()
                .oneOf([yup.ref('password'), null], 'Passwords must match')
                .required(),
              enableCloudSync: yup.boolean(),
              iterations: yup.number().min(10000).required(),
            })
          }
          onSubmit={(values, { setErrors, setSubmitting }) => {
            (async () => {
              // Step 1. create local user
              const createUserResult = await createNewUser(localDB as any, {
                username: values.username,
                password: values.password,
                enableCloudSync: values.enableCloudSync,
                iterations: values.iterations,
              });

              if ('error' in createUserResult) {
                setSubmitting(false);

                switch (createUserResult.errorCode) {
                  case 'user_exist':
                    return setErrors({ username: 'Username already in use.' });
                  case 'iterations_too_low':
                    return setErrors({ iterations: 'PBKDF2 iterations amount too low.' });
                  default:
                    // unhandled error, ooops
                    console.log(createUserResult);
                    return;
                }
              }

              // Step 2. register to cloud sync, if enabled
              let cloudSyncSessionToken;

              if (values.enableCloudSync) {
                const token = await generateTokenFromPassword(values.password, values.username);

                const registerCloudSyncResult = await prepareAndRegisterToCloudSync({
                  user: createUserResult.user,
                  token,
                  db: localDB as any,
                  cloudSyncPasswordKey: createUserResult.cloudSyncPasswordKey,
                });

                if (registerCloudSyncResult.error || !registerCloudSyncResult.sessionToken) {
                  setSubmitting(false);

                  if (registerCloudSyncResult.error === 'username already exist') {
                    setErrors({ username: 'username already in use' });
                  } else {
                    // unhandled error, oops
                  }

                  return;
                }

                cloudSyncSessionToken = registerCloudSyncResult.sessionToken;
              }

              setCloudSyncPasswordKey(createUserResult.cloudSyncPasswordKey || null);

              setUser(createUserResult.user);
              setPasswordKey(createUserResult.passwordKey);
              setFileCollection(createUserResult.fileCollection);

              // Step 3. save cloud sync session token
              if (values.enableCloudSync) {
                await updateUser({
                  userItem: {
                    ...createUserResult.user,
                    cloudSyncSessionToken,
                    cloudLastSynced: moment().unix(),
                  },
                  noCloudSync: true,
                });
              }

              setDone(true);
            })();
          }}
        >
          {({ handleSubmit, handleChange, handleBlur, values, isSubmitting, errors, touched }) => (
            <React.Fragment>
              <form onSubmit={handleSubmit} autoComplete='off'>
                <Typography variant='body2' color='textSecondary'>
                  Slater Notes is a privacy-focused notes platform therefore we do not collect any
                  information that may personally identify you. That includes your email address.
                </Typography>

                <TextField
                  name='username'
                  label='Username'
                  variant='outlined'
                  fullWidth
                  autoFocus
                  value={values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={values.username.length > 0 && !!errors.username}
                  helperText={
                    values.username.length > 0 &&
                    errors.username &&
                    errors.username.charAt(0).toUpperCase() + errors.username.slice(1)
                  }
                />

                <Divider />

                <Typography variant='body2' color='textSecondary'>
                  Your notes are end-to-end encrypted with your password. If you forget your
                  password, there is no way to recover your notes. We recommend storing your
                  password in a password manager.
                </Typography>

                <TextField
                  type='password'
                  name='password'
                  label='Password'
                  variant='outlined'
                  fullWidth
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={values.password.length > 0 && !!errors.password}
                  helperText={
                    values.password.length > 0 &&
                    errors.password &&
                    errors.password.charAt(0).toUpperCase() + errors.password.slice(1)
                  }
                />

                <TextField
                  type='password'
                  name='password2'
                  label='Confirm Password'
                  variant='outlined'
                  fullWidth
                  value={values.password2}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={values.password2.length > 0 && !!errors.password2}
                  helperText={
                    values.password2.length > 0 &&
                    errors.password2 &&
                    errors.password2.charAt(0).toUpperCase() + errors.password2.slice(1)
                  }
                />

                <Divider />

                <Accordion>
                  <AccordionSummary expandIcon={<ChevronDown size={16} />}>
                    <Typography variant='body1'>Advanced Settings</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant='body2' color='textSecondary'>
                      You can choose to disable cloud sync. This means that your account and notes
                      stay on your device. Nothing touches a server. No one knows your account
                      exists.
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.enableCloudSync}
                          onChange={handleChange}
                          name='enableCloudSync'
                        />
                      }
                      label='Enable Cloud Sync'
                    />
                    <Divider />
                    <Typography variant='body2' color='textSecondary'>
                      A higher iteration count means slow login time{' '}
                      <strong>but higher resistance to password cracking attacks</strong>.{' '}
                      <a
                        href='https://support.1password.com/pbkdf2/'
                        target='_blank'
                        rel='noreferrer'
                      >
                        Learn more
                      </a>
                    </Typography>
                    <TextField
                      type='number'
                      name='iterations'
                      label='PBKDF2 Iterations'
                      variant='outlined'
                      fullWidth
                      value={values.iterations}
                      onChange={(e) => {
                        setIterationsResult(null);
                        handleChange(e);
                      }}
                      onBlur={handleBlur}
                      error={touched.iterations && !!errors.iterations}
                      helperText={
                        touched.iterations &&
                        errors.iterations &&
                        errors.iterations.charAt(0).toUpperCase() + errors.iterations.slice(1)
                      }
                    />
                    {(!values.password || !values.password2) && (
                      <Typography variant='body2'>
                        Enter a password first before testing its iterations.
                      </Typography>
                    )}
                    {typeof iterationsResult === 'number' && (
                      <Typography variant='body2' color='textSecondary'>
                        <strong>{values.iterations.toLocaleString()}</strong> iterations of your
                        password took{' '}
                        <strong>{iterationsResult > 100 ? iterationsResult : '<100'}ms</strong> on
                        your computer.
                      </Typography>
                    )}
                    <DefaultButton
                      buttonProps={{
                        variant: 'contained',
                        color: 'primary',
                        size: 'small',
                        disabled: !values.password || !values.password2 || testingIterations,
                        onClick: async () => {
                          setTestingIterations(true);
                          setIterationsResult(null);
                          const start = window.performance.now();

                          await getKeyFromDerivedPassword(
                            values.password,
                            generateSalt(),
                            true,
                            values.iterations,
                          );

                          const end = window.performance.now();
                          setIterationsResult(Math.round(end - start));
                          setTestingIterations(false);
                        },
                      }}
                      text='Test Iterations'
                      isLoading={testingIterations}
                    />
                  </AccordionDetails>
                </Accordion>

                <Divider />

                <DefaultButton
                  buttonProps={{
                    type: 'submit',
                    variant: 'contained',
                    size: 'large',
                    color: 'primary',
                    fullWidth: true,
                    disabled: isSubmitting || testingIterations,
                  }}
                  text='Submit'
                  isLoading={isSubmitting}
                />
              </form>
            </React.Fragment>
          )}
        </Formik>
      </div>

      <div>
        <DefaultButton
          text='Cancel'
          type='error'
          buttonProps={{
            color: 'inherit',
            fullWidth: true,
            href: '/login',
          }}
        />
      </div>
    </LoginPage>
  );
};

const useStyles = makeStyles({
  formContainer: {
    width: '100%',

    '& form > *, .MuiAccordionDetails-root > *': {
      marginBottom: '1rem',
      textAlign: 'left',
    },

    '& form > hr': {
      marginTop: '1rem',
      marginBottom: '2rem',
    },
  },
});

const Accordion = withStyles({
  root: {
    color: 'inherit',
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
})(MuiAccordion);

const AccordionSummary = withStyles((theme) => ({
  root: {
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.default,
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
}))(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    color: theme.palette.text.secondary,
    padding: theme.spacing(3),
    display: 'block',
  },
}))(MuiAccordionDetails);

export default Signup;
