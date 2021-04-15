import useLoading, { ErrorOrNull } from './useLoading';
import generateTokenFromPassword from '../utils/generateTokenFromPassword';
import getNewSessionFromCloudSync from '../api/cloudSync/getNewSession';
import getAccountFromCloudSync from '../api/cloudSync/getAccount';
import decryptAndSaveUserFromBase64 from '../services/decryptAndSaveUserFromBase64';
import saveFileCollectionFromBase64 from '../services/saveFileCollectionFromBase64';
import { useStoreActions } from '../store/typedHooks';
import loadUserFromDisk from '../services/loadUserFromDisk';
import syncAccountAndNotesToCloudSync from '../services/syncAccountAndNotesToCloudSync';
import moment from 'moment';

type LoginPayload = {
  username: string;
  password: string;
};

const useCloudSyncLogin = (): {
  start: (payload: LoginPayload) => Promise<void>;
  isLoading: boolean;
  error: ErrorOrNull;
  isComplete: boolean;
  reset: () => void;
} => {
  const [isLoading, error, isComplete, setIsLoading, setError, setIsComplete, reset] = useLoading();

  const setUser = useStoreActions((a) => a.setUser);
  const setPasswordKey = useStoreActions((a) => a.setPasswordKey);
  const setCloudSyncPasswordKey = useStoreActions((a) => a.setCloudSyncPasswordKey);
  const setFileCollection = useStoreActions((a) => a.setFileCollection);
  const setSettings = useStoreActions((a) => a.setSettings);

  const startLogin = async ({ username, password }: LoginPayload) => {
    setIsLoading(true);

    // Verify account and get sessionToken
    const token = await generateTokenFromPassword(password, username);

    const session = await getNewSessionFromCloudSync({
      username,
      token,
    });

    if ('error' in session) {
      switch (session.error) {
        case 'user does not exist':
          setError({ ...session, errorCode: 'no_user' });
          break;
        case 'token does not match':
          setError({ ...session, errorCode: 'wrong_password' });
          break;
        default:
          setError(session);
      }

      return;
    }

    const sessionToken = session.sessionToken;

    // Fetch account, then save user and fileCollection to disk
    const fetchAccount = await getAccountFromCloudSync({
      username,
      sessionToken,
    });

    if ('error' in fetchAccount) {
      setError(fetchAccount);
      return;
    }

    const saveUser = await decryptAndSaveUserFromBase64(username, password, fetchAccount.userItem);

    if ('error' in saveUser) {
      setError(saveUser);
      return;
    }

    await saveFileCollectionFromBase64(saveUser.userItem, fetchAccount.fileCollection);

    // Load user from disk
    const loadUser = await loadUserFromDisk({ username, password });

    if ('error' in loadUser) {
      setError(loadUser);
      return;
    }

    // Start full sync
    const sync = await syncAccountAndNotesToCloudSync({
      sessionToken,
      user: loadUser.user,
      fileCollection: loadUser.fileCollection,
      fileCollectionNonce: loadUser.user.fileCollectionNonce,
      passwordKey: loadUser.passwordKey,
      cloudSyncPasswordKey: loadUser.cloudSyncPasswordKey,
    });

    if ('error' in sync) {
      setError(sync);
      return;
    }

    const user = { ...loadUser.user, cloudLastSynced: moment().unix() };

    setUser(user);
    setPasswordKey(loadUser.passwordKey);
    setCloudSyncPasswordKey(loadUser.cloudSyncPasswordKey);
    setFileCollection(loadUser.fileCollection);
    setSettings(loadUser.settings);

    setIsComplete(true);
  };

  return { start: startLogin, isLoading, error, isComplete, reset };
};

export default useCloudSyncLogin;
