import {
  bufferToString,
  base64ToBuffer,
  decrypt,
  stringToBuffer,
  getKeyFromDerivedPassword,
  UserItem,
} from '@slater-notes/core';
import { defaultCloudSyncPasswordIterations } from '../config/cloudSync';
import { UserSettingsOptions } from '../config/defaultUserSettings';
import { FileCollection } from '../types/notes';
import { StandardError } from '../types/response';
import { FILE_COLLECTION_KEY, SETTINGS_KEY } from '../utils/DBIndexKeys';
import disk from '../utils/disk';
import getUserItemFromDisk from './getUserItemFromDisk';

interface Payload {
  username: string;
  password: string;
}

type SuccessResponse = {
  user: UserItem;
  passwordKey: CryptoKey;
  cloudSyncPasswordKey: CryptoKey;
  fileCollection: FileCollection;
  settings: Partial<UserSettingsOptions> | null;
};

const getDecryptedAccountFromDisk = async (
  payload: Payload,
): Promise<SuccessResponse | StandardError> => {
  const user = await getUserItemFromDisk(payload.username);

  if (!user) {
    return {
      errorCode: 'no_user',
      error: 'No user with that username.',
    };
  }

  const encryptedData = await disk.get(`${FILE_COLLECTION_KEY}--${user.id}`);

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
  const encryptedSettingsData = await disk.get(`${SETTINGS_KEY}--${user.id}`);

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
    user,
    passwordKey,
    cloudSyncPasswordKey,
    fileCollection,
    settings,
  };
};

export default getDecryptedAccountFromDisk;
