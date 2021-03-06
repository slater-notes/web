import useLoading, { ErrorOrNull } from './useLoading';
import generateTokenFromPassword from '../utils/generateTokenFromPassword';
import getNewSessionFromCloudSync from '../api/cloudSync/getNewSession';
import getAccountFromCloudSync from '../api/cloudSync/getAccount';
import decryptAndSaveUserToDisk from '../services/decryptAndSaveUserToDisk';
import saveBase64FileCollectionToDisk from '../services/saveBase64FileCollectionToDisk';
import { useStoreActions } from '../store/typedHooks';
import getDecryptedAccountFromDisk from '../services/getDecryptedAccountFromDisk';
import syncAccountAndNotesToCloudSync from '../services/syncAccountAndNotesToCloudSync';
import moment from 'moment';

interface LoginPayload {
  username: string;
  password: string;
}

interface ReturnObject {
  start: (payload: LoginPayload) => Promise<void>;
  isLoading: boolean;
  error: ErrorOrNull;
  isComplete: boolean;
  reset: () => void;
}

const useCloudSyncLogin = (): ReturnObject => {
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

    const saveUser = await decryptAndSaveUserToDisk(username, password, fetchAccount.userItem);

    if ('error' in saveUser) {
      setError(saveUser);
      return;
    }

    await saveBase64FileCollectionToDisk(saveUser.userItem, fetchAccount.fileCollection);

    // Load user from disk
    const loadUser = await getDecryptedAccountFromDisk({ username, password });

    if ('error' in loadUser) {
      setError(loadUser);
      return;
    }

    // Start full sync
    const sync = await syncAccountAndNotesToCloudSync({
      sessionToken,
      user: loadUser.user,
      upstreamFileCollection: loadUser.fileCollection,
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
    setFileCollection(sync.fileCollection);
    setSettings(loadUser.settings);

    setIsComplete(true);
  };

  return { start: startLogin, isLoading, error, isComplete, reset };
};

export default useCloudSyncLogin;
