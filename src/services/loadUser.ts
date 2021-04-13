import {
  bufferToString,
  base64ToBuffer,
  decrypt,
  stringToBuffer,
  getKeyFromDerivedPassword,
  localDB,
  UserItem,
} from '@slater-notes/core';
import { defaultCloudSyncPasswordIterations } from '../config/cloudSync';
import { UserSettingsOptions } from '../config/defaultUserSettings';
import { FileCollection } from '../types/notes';
import { StandardError } from '../types/response';
import { FILE_COLLECTION_KEY, SETTINGS_KEY, USERS_KEY } from '../utils/DBIndexKeys';

interface Payload {
  username: string;
  password: string;
}

type SuccessResponse = {
  success: true;
  user: UserItem;
  passwordKey: CryptoKey;
  cloudSyncPasswordKey: CryptoKey;
  fileCollection: FileCollection;
  settings: Partial<UserSettingsOptions> | null;
};

type Response = SuccessResponse | StandardError;

const loadUser = async (db: localDB, payload: Payload): Promise<Response> => {
  const usersJson = (await db.get(USERS_KEY)) as string | undefined;
  const users: UserItem[] = usersJson ? JSON.parse(usersJson) : [];
  const user = users.find((u) => u.username === payload.username);

  if (users.length === 0 || !user) {
    return {
      errorCode: 'no_user',
      error: 'No user with that username.',
    };
  }

  const encryptedData = await db.get(`${FILE_COLLECTION_KEY}--${user.id}`);

  if (!(encryptedData instanceof Uint8Array)) {
    return {
      errorCode: 'no_file_collection',
      error: 'User has no file collection database',
    };
  }

  const passwordKey = await getKeyFromDerivedPassword(
    payload.password,
    base64ToBuffer(user.salt),
    true,
    user.iterations,
  );

  let decryptedData;
  try {
    decryptedData = await decrypt(
      passwordKey,
      base64ToBuffer(user.fileCollectionNonce),
      encryptedData,
    );
  } catch (_e) {
    return {
      errorCode: 'bad_key',
      error: 'Bad decryption key.',
    };
  }

  const fileCollection = JSON.parse(bufferToString(decryptedData));

  let settings: Partial<UserSettingsOptions> | null = null;
  const encryptedSettingsData = await db.get(`${SETTINGS_KEY}--${user.id}`);

  if (encryptedSettingsData instanceof Uint8Array) {
    let decryptedSettingsData;
    try {
      decryptedSettingsData = await decrypt(
        passwordKey,
        base64ToBuffer(user.settingsNonce),
        encryptedSettingsData,
      );
    } catch (_e) {
      console.log('meeep');
      return {
        errorCode: 'bad_key',
        error: 'Bad decryption key.',
      };
    }

    settings = JSON.parse(bufferToString(decryptedSettingsData));
  }

  const cloudSyncPasswordKey = await getKeyFromDerivedPassword(
    payload.password,
    stringToBuffer(payload.username),
    true,
    defaultCloudSyncPasswordIterations,
  );

  return {
    success: true,
    user,
    passwordKey,
    cloudSyncPasswordKey,
    fileCollection,
    settings,
  };
};

export default loadUser;
