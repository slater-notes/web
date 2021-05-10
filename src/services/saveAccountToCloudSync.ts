import {
  base64ToBuffer,
  bufferToBase64,
  encrypt,
  stringToBuffer,
  UserItem,
} from '@slater-notes/core';
import { debounce } from 'lodash';
import updateAccountToCloudSync from '../api/cloudSync/updateAccount';
import { FileCollection } from '../types/notes';
import { StandardResponse } from '../types/response';

interface Payload {
  user: UserItem;
  fileCollection: FileCollection;
  fileCollectionNonce: string;
  sessionToken: string;
  passwordKey: CryptoKey;
  cloudSyncPasswordKey: CryptoKey;
}

const saveAccountToCloudSync = async (payload: Payload): Promise<StandardResponse> => {
  // encrypt fileCollection and output as base64
  const fileCollectionJson = JSON.stringify(payload.fileCollection);
  const fileCollecitonEnc = await encrypt(
    payload.passwordKey,
    base64ToBuffer(payload.fileCollectionNonce),
    stringToBuffer(fileCollectionJson),
  );

  const fileCollectionDataBase64 = bufferToBase64(fileCollecitonEnc);

  // encrypt userItem and output as base64
  const userItemJson = JSON.stringify(payload.user);
  const userItemEnc = await encrypt(
    payload.cloudSyncPasswordKey,
    stringToBuffer(payload.user.username),
    stringToBuffer(userItemJson),
  );

  const userItemDataBase64 = bufferToBase64(userItemEnc);

  return updateAccountToCloudSync({
    username: payload.user.username,
    sessionToken: payload.sessionToken,
    userItem: userItemDataBase64,
    fileCollection: fileCollectionDataBase64,
  });
};

export default saveAccountToCloudSync;

export const saveAccountToCloudSyncDebounced = debounce(saveAccountToCloudSync, 500, {
  leading: false,
});
