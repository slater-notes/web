import prepareAndRegisterToCloudSync from '../services/prepareAndRegisterToCloudSync';
import verifyPasswordLocally from '../services/verifyPasswordLocally';
import { useStoreActions, useStoreState } from '../store/typedHooks';
import generateTokenFromPassword from '../utils/generateTokenFromPassword';
import useLoading, { ErrorOrNull } from './useLoading';

const useCloudSyncRegister = (): [
  (password: string) => Promise<void>,
  boolean,
  ErrorOrNull,
  boolean,
  () => void,
] => {
  const [isLoading, error, isComplete, setIsLoading, setError, setIsComplete, reset] = useLoading();

  const user = useStoreState((s) => s.user);
  const cloudSyncPasswordKey = useStoreState((s) => s.cloudSyncPasswordKey);

  const updateUser = useStoreActions((s) => s.updateUser);

  const startRegister = async (password: string) => {
    setIsLoading(true);

    if (!user || !cloudSyncPasswordKey) {
      setError({ error: 'Expected truthy values from store.' });
      return;
    }

    if (!password) {
      setError({ error: 'Password is empty.' });
      return;
    }

    const { username } = user;

    const token = await generateTokenFromPassword(password, username);
    const verify = await verifyPasswordLocally({ username, password });

    if ('error' in verify) {
      if (verify.errorCode === 'bad_key') setError({ error: 'Invalid password.' });
      else setError({ error: verify.error });

      return;
    }

    const register = await prepareAndRegisterToCloudSync({
      user,
      token,
      cloudSyncPasswordKey,
    });

    if ('error' in register) {
      setError({ error: register.error });
      return;
    }

    await updateUser({
      userItem: { ...user, cloudSyncSessionToken: register.sessionToken },
      noCloudSync: true,
    });

    setIsLoading(false);
    setIsComplete(true);
  };

  return [startRegister, isLoading, error, isComplete, reset];
};

export default useCloudSyncRegister;
