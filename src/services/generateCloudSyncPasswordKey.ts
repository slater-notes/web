import { stringToBuffer, getKeyFromDerivedPassword } from '@slater-notes/core';
import { defaultCloudSyncPasswordIterations } from '../config/cloudSync';

interface Payload {
  username: string;
  password: string;
}

const generateCloudSyncPasswordKey = async ({ username, password }: Payload) => {
  return await getKeyFromDerivedPassword(
    password,
    stringToBuffer(username),
    true,
    defaultCloudSyncPasswordIterations,
  );
};

export default generateCloudSyncPasswordKey;
