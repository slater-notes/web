import moment from 'moment';
import checkSessionFromCloudSync from '../api/cloudSync/checkSession';
import { syncAccountAndNotesToCloudSyncWorkerized } from '../services/syncAccountAndNotesToCloudSync';
import { useStoreActions, useStoreState } from '../store/typedHooks';
import useLoading, { ErrorOrNull } from './useLoading';

/**
 * what this hook does:
 * - show loading, error
 * - validate session token
 * - invoke full sync on web worker
 * - update fileCollection after sync
 *
 * What this hook does not do:
 * - register to cloud sync
 */
const useFullSync = (): [() => Promise<void>, boolean, ErrorOrNull, boolean, () => void] => {
  const [isLoading, error, isComplete, setIsLoading, setError, setIsComplete, reset] = useLoading();

  const localDB = useStoreState((s) => s.localDB);
  const workers = useStoreState((s) => s.workers);
  const user = useStoreState((s) => s.user);
  const passwordKey = useStoreState((s) => s.passwordKey);
  const cloudSyncPasswordKey = useStoreState((s) => s.cloudSyncPasswordKey);
  const fileCollection = useStoreState((s) => s.fileCollection);

  const updateUser = useStoreActions((s) => s.updateUser);
  const updateFileCollection = useStoreActions((s) => s.updateFileCollection);

  const startSync = async () => {
    setIsLoading(true);

    if (!localDB || !workers || !user || !passwordKey || !fileCollection) {
      setError({ error: 'Expected truthy values from store.' });
      return;
    }

    const { username, fileCollectionNonce, cloudSyncSessionToken } = user;

    if (!cloudSyncSessionToken) {
      setError({ errorCode: 'no_session_token', error: 'User does not have a session token' });
      return;
    }

    if (!cloudSyncPasswordKey) {
      setError({ errorCode: 'no_cloudsync_pass', error: 'Cloud sync password is empty.' });
      return;
    }

    const sessionCheck = await checkSessionFromCloudSync({
      username: username,
      sessionToken: cloudSyncSessionToken,
    });

    if ('error' in sessionCheck) {
      setError({ errorCode: 'invalid_session', error: sessionCheck.error || '' });
      return;
    }

    // start full sync
    const sync = await syncAccountAndNotesToCloudSyncWorkerized(workers, {
      sessionToken: cloudSyncSessionToken,
      user,
      fileCollection,
      fileCollectionNonce,
      passwordKey,
      cloudSyncPasswordKey,
    });

    if ('error' in sync) {
      setError({ errorCode: 'sync_error', error: sync.error });
      return;
    }

    await updateFileCollection(sync.fileCollection);
    await updateUser({
      userItem: { ...user, cloudLastSynced: moment().unix() },
      noCloudSync: true,
    });

    setIsComplete(true);
  };

  return [startSync, isLoading, error, isComplete, reset];
};

export default useFullSync;
