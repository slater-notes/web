import { base64ToBuffer, decrypt, getKeyFromDerivedPassword, UserItem } from '@slater-notes/core';
import { StandardError } from '../types/response';
import { FILE_COLLECTION_KEY, USERS_KEY } from '../utils/DBIndexKeys';
import disk from '../utils/disk';

interface Payload {
  username: string;
  password: string;
}

type SuccessResponse = {
  success: boolean;
};

const verifyPassword = async (payload: Payload): Promise<SuccessResponse | StandardError> => {
  const usersJson = (await disk.get(USERS_KEY)) as string | undefined;
  const users: UserItem[] = usersJson ? JSON.parse(usersJson) : [];
  const user = users.find((u) => u.username === payload.username);

  if (users.length === 0 || !user) {
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

export default verifyPassword;
