import { bufferToBase64, encrypt, localDB, stringToBuffer, UserItem } from '@slater-notes/core';
import { ErrorResult } from './api/types';
import getFileCollectionAsBase64 from '../local/getFileCollectionAsBase64';
import registerToCloudSync from './api/registerAccount';

interface Payload {
  user: UserItem;
  token: string;
  db: localDB;
  cloudSyncPasswordKey: CryptoKey;
}

interface Result extends ErrorResult {
  success?: boolean;
  sessionToken?: string;
}

const prepareAndRegisterToCloudSync = async (payload: Payload): Promise<Result> => {
  // encrypt userItem and output as base64
  const json = JSON.stringify(payload.user);
  const encryptedData = await encrypt(
    payload.cloudSyncPasswordKey,
    stringToBuffer(payload.user.username),
    stringToBuffer(json),
  );

  const userItem = bufferToBase64(encryptedData);

  // get fileColleciton as base64
  const fileCollection = await getFileCollectionAsBase64(payload.db, payload.user.id);

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
