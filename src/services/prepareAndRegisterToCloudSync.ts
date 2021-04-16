import { bufferToBase64, encrypt, stringToBuffer, UserItem } from '@slater-notes/core';
import { StandardError, StandardSuccess } from '../types/response';
import getFileCollectionFromDiskAsBase64 from './getFileCollectionFromDiskAsBase64';
import registerToCloudSync from '../api/cloudSync/registerAccount';

interface Payload {
  user: UserItem;
  token: string;
  cloudSyncPasswordKey: CryptoKey;
}

interface SuccessResponse extends StandardSuccess {
  sessionToken?: string;
}

const prepareAndRegisterToCloudSync = async (
  payload: Payload,
): Promise<SuccessResponse | StandardError> => {
  // encrypt userItem and output as base64
  const json = JSON.stringify(payload.user);
  const encryptedData = await encrypt(
    payload.cloudSyncPasswordKey,
    stringToBuffer(payload.user.username),
    stringToBuffer(json),
  );

  const userItem = bufferToBase64(encryptedData);

  // get fileColleciton as base64
  const fileCollection = await getFileCollectionFromDiskAsBase64(payload.user.id);

  if (!fileCollection) {
    return { error: 'unknown error' };
  }

  // call api
  const result = await registerToCloudSync({
    username: payload.user.username,
    token: payload.token,
    userItem,
    fileCollection,
  });

  return result;
};

export default prepareAndRegisterToCloudSync;
