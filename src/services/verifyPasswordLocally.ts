import { base64ToBuffer, decrypt, getKeyFromDerivedPassword } from '@slater-notes/core';
import { StandardError } from '../types/response';
import { FILE_COLLECTION_KEY } from '../utils/DBIndexKeys';
import disk from '../utils/disk';
import getUserItemFromDisk from './getUserItemFromDisk';

interface Payload {
  username: string;
  password: string;
}

type SuccessResponse = {
  success: boolean;
};

const verifyPasswordLocally = async (
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

  try {
    await decrypt(passwordKey, base64ToBuffer(user.fileCollectionNonce), encryptedData);
  } catch (_e) {
    return {
      errorCode: 'bad_key',
      error: 'Bad decryption key.',
    };
  }

  return { success: true };
};

export default verifyPasswordLocally;
