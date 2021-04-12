import prepareAndRegisterToCloudSync from '../services/cloudSync/prepareAndRegister';
import verifyPassword from '../services/local/verifyPassword';
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

  const localDB = useStoreState((s) => s.localDB);
  const user = useStoreState((s) => s.user);
  const cloudSyncPasswordKey = useStoreState((s) => s.cloudSyncPasswordKey);

  const updateUser = useStoreActions((s) => s.updateUser);

  const startRegister = async (password: string) => {
    setIsLoading(true);

    if (!localDB || !user || !cloudSyncPasswordKey) {
      setError({ error: 'Expected truthy values from store.' });
      return;
    }

    if (!password) {
      setError({ error: 'Password is empty.' });
      return;
    }

    const { username } = user;

    const token = await generateTokenFromPassword(password, username);
    const verify = await verifyPassword(localDB, { username, password });

    if (verify.error) {
      if (verify.error.code === 'bad_key') setError({ error: 'Invalid password.' });
      else setError({ error: verify.error.message });

      return;
    }

    const { error, sessionToken } = await prepareAndRegisterToCloudSync({
      user,
      token,
      db: localDB,
      cloudSyncPasswordKey,
    });

    if (error || !sessionToken) {
      setError({ error: error || 'Failed to register user to the cloud sync server.' });
      return;
    }

    await updateUser({
      userItem: { ...user, cloudSyncSessionToken: sessionToken },
      noCloudSync: true,
    });

    setIsLoading(false);
    setIsComplete(true);
  };

  return [startRegister, isLoading, error, isComplete, reset];
};

export default useCloudSyncRegister;
