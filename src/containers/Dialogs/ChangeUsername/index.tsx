import { TextField, useTheme } from '@material-ui/core';
import React from 'react';
import DefaultDialog from '../../../components/Dialogs/DefaultDialog';
import changeUsername from '../../../services/local/changeUsername';
import { useStoreActions, useStoreState } from '../../../stores/mainStore/typedHooks';
import * as yup from 'yup';

interface Props {
  onDone: (changed?: boolean) => void;
}

const ChangeUsername = (props: Props) => {
  const theme = useTheme();

  const [username, setUsername] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const user = useStoreState((s) => s.user);
  const localDB = useStoreState((s) => s.localDB);

  const setUser = useStoreActions((s) => s.setUser);

  const handleChangeUsername = async () => {
    if (!localDB || !user) {
      return;
    }

    setIsLoading(true);

    let un;
    try {
      un = await yup
        .string()
        .ensure()
        .trim()
        .min(3)
        .lowercase()
        .matches(/^[a-z0-9]+$/, 'username must be alphanumeric')
        .validate(username);
    } catch (error) {
      console.log(error);

      if (error.errors) {
        setError(error.errors[0]);
      }

      setIsLoading(false);
      return;
    }

    const result = await changeUsername(localDB, user, un);

    if (result.error) {
      setError(result.error.message);
      setIsLoading(false);
      return;
    }

    // update UI
    setUser({ ...user, username: un });

    props.onDone(true);
  };

  return (
    <React.Fragment>
      <DefaultDialog
        title='Enter a New Username'
        text={
          <React.Fragment>
            <div style={{ marginBottom: theme.spacing(2) }}>
              <p>
                Change your username: <b>{user?.username}</b>
              </p>
              <p>If you use a password manager, don't forget to change the username there.</p>
            </div>
            <div>
              <TextField
                name='username'
                type='string'
                label='New Username'
                variant='standard'
                autoComplete='off'
                disabled={isLoading}
                fullWidth
                autoFocus
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleChangeUsername();
                  }
                }}
              />
            </div>
          </React.Fragment>
        }
        withCancel
        withConfirm
        autoFocusCancelButton={false}
        cancelButtonDisabled={isLoading}
        confirmButtonDisabled={isLoading}
        confirmButtonIsLoading={isLoading}
        confirmLabel='Change Username'
        confirmButtonColor='secondary'
        onCancel={() => props.onDone()}
        onConfirm={() => handleChangeUsername()}
        nonCloseable={isLoading}
      />

      {typeof error === 'string' && (
        <DefaultDialog
          title='Error'
          text={`An error occured: ${error}`}
          withCancel
          cancelLabel='Close'
          autoFocusCancelButton
          onCancel={() => setError(null)}
        />
      )}
    </React.Fragment>
  );
};

export default ChangeUsername;
