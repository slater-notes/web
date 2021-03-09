import { stringToBuffer, exportKey, getKeyFromDerivedPassword } from '@slater-notes/core';
import { defaultCloudSyncPasswordIterations } from '../config/cloudSync';

const generateTokenFromPassword = async (password: string, salt: string) => {
  const tokenKey = await getKeyFromDerivedPassword(
    password,
    stringToBuffer(salt),
    true,
    defaultCloudSyncPasswordIterations,
    true,
  );

  return await exportKey(tokenKey);
};

export default generateTokenFromPassword;
