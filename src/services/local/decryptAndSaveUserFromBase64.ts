import {
  bufferToString,
  base64ToBuffer,
  decrypt,
  getKeyFromDerivedPassword,
  localDB,
  stringToBuffer,
  UserItem,
} from '@slater-notes/core';
import { defaultCloudSyncPasswordIterations } from '../../config/cloudSync';
import saveUser from './saveUser';
import { ServiceResponse } from './services';

interface Response extends ServiceResponse {
  success?: boolean;
  userItem?: UserItem;
}

const decryptAndSaveUserFromBase64 = async (
  db: localDB,
  username: string,
  password: string,
  userItemData: string,
): Promise<Response> => {
  // create passwordKey from username and password
  const passwordKey = await getKeyFromDerivedPassword(
    password,
    stringToBuffer(username),
    true,
    defaultCloudSyncPasswordIterations,
  );

  // userItemData is encrypted, need to decrypt that first before saving to localDB
  const data = base64ToBuffer(userItemData);

  let decryptedData;
  try {
    decryptedData = await decrypt(passwordKey, stringToBuffer(username), data);
  } catch (error) {
    return {
      error: {
        code: 'bad_key',
        message: 'Bad decryption key.',
      },
    };
  }

  const userItem: UserItem = JSON.parse(bufferToString(decryptedData));

  //  save to localDB
  const result = await saveUser(db, userItem);

  if (!result.success) {
    return result;
  }

  return { success: true, userItem };
};

export default decryptAndSaveUserFromBase64;
