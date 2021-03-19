import {
  bufferToString,
  base64ToBuffer,
  decrypt,
  stringToBuffer,
  getKeyFromDerivedPassword,
  localDB,
  UserItem,
} from '@slater-notes/core';
import { defaultCloudSyncPasswordIterations } from '../../config/cloudSync';
import { UserSettingsOptions } from '../../stores/mainStore/defaultUserSettings';
import { FileCollection } from '../../types/notes';
import { FILE_COLLECTION_KEY, SETTINGS_KEY, USERS_KEY } from '../../utils/DBIndexKeys';
import { ServiceResponse } from './services';

interface Payload {
  username: string;
  password: string;
}

interface Response extends ServiceResponse {
  user?: UserItem;
  passwordKey?: CryptoKey;
  cloudSyncPasswordKey?: CryptoKey;
  fileCollection?: FileCollection;
  settings?: Partial<UserSettingsOptions> | null;
}

const loadUser = async (db: localDB, payload: Payload): Promise<Response> => {
  const usersJson = (await db.get(USERS_KEY)) as string | undefined;
  const users: UserItem[] = usersJson ? JSON.parse(usersJson) : [];
  const user = users.find((u) => u.username === payload.username);

  if (users.length === 0 || !user) {
    return {
      error: {
        code: 'no_user',
        message: 'No user with that username.',
      },
    };
  }

  const encryptedData = await db.get(`${FILE_COLLECTION_KEY}--${user.id}`);

  if (!(encryptedData instanceof Uint8Array)) {
    return {
      error: {
        code: 'no_file_collection',
        message: 'User has no file collection database',
      },
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
      error: {
        code: 'bad_key',
        message: 'Bad decryption key.',
      },
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
        error: {
          code: 'bad_key',
          message: 'Bad decryption key.',
        },
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
    user,
    passwordKey,
    cloudSyncPasswordKey,
    fileCollection,
    settings,
  };
};

export default loadUser;
