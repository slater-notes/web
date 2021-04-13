import {
  bufferToString,
  base64ToBuffer,
  decrypt,
  getKeyFromDerivedPassword,
  localDB,
  stringToBuffer,
  UserItem,
} from '@slater-notes/core';
import { defaultCloudSyncPasswordIterations } from '../config/cloudSync';
import { StandardError } from '../types/response';
import saveUser from './saveUser';

type SuccessResponse = {
  success: true;
  userItem: UserItem;
};

type Response = SuccessResponse | StandardError;

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
      errorCode: 'bad_key',
      error: 'Bad decryption key.',
    };
  }

  const userItem: UserItem = JSON.parse(bufferToString(decryptedData));

  //  save to localDB
  await saveUser(db, userItem);

  return { success: true, userItem };
};

export default decryptAndSaveUserFromBase64;
