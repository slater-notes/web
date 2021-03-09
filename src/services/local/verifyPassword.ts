import {
  base64ToBuffer,
  decrypt,
  getKeyFromDerivedPassword,
  localDB,
  UserItem,
} from '@slater-notes/core';
import { FILE_COLLECTION_KEY, USERS_KEY } from '../../utils/DBIndexKeys';
import { ServiceResponse } from './services';

interface Payload {
  username: string;
  password: string;
}

interface Response extends ServiceResponse {
  success?: boolean;
}

const verifyPassword = async (db: localDB, payload: Payload): Promise<Response> => {
  const usersJson = (await db.get(USERS_KEY)) as string | undefined;
  const users: UserItem[] = usersJson ? JSON.parse(usersJson) : [];
  const user = users.find((u) => u.username === payload.username);

  if (users.length === 0 || !user) {
    return {
      error: {
        code: 'no_user',
        message: 'No user with that username.',
      },
    };
  }

  const encryptedData = await db.get(`${FILE_COLLECTION_KEY}--${user.id}`);

  if (!(encryptedData instanceof Uint8Array)) {
    return {
      error: {
        code: 'no_file_collection',
        message: 'User has no file collection database',
      },
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
      error: {
        code: 'bad_key',
        message: 'Bad decryption key.',
      },
    };
  }

  return { success: true };
};

export default verifyPassword;
