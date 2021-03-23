import { nanoid } from 'nanoid';
import {
  encrypt,
  generateNonce,
  generateSalt,
  getKeyFromDerivedPassword,
  localDB,
  stringToBuffer,
  bufferToBase64,
  UserItem,
} from '@slater-notes/core';
import { FILE_COLLECTION_KEY, USERS_KEY } from '../../utils/DBIndexKeys';
import { ServiceResponse } from './services';
import { FileCollection } from '../../types/notes';
import { defaultCloudSyncPasswordIterations } from '../../config/cloudSync';

interface Payload {
  username: string;
  password: string;
  enableCloudSync?: boolean;
  iterations?: number;
}

interface Response extends ServiceResponse {
  user?: UserItem;
  passwordKey?: CryptoKey;
  cloudSyncPasswordKey?: CryptoKey;
  fileCollection?: FileCollection;
}

const createNewUser = async (db: localDB, payload: Payload): Promise<Response> => {
  const usersJson = (await db.get(USERS_KEY)) as string | undefined;
  let users: UserItem[] = usersJson ? JSON.parse(usersJson) : [];

  // check that this user does not exist
  if (users && users.findIndex((u) => u.username === payload.username) > -1) {
    return {
      error: {
        code: 'user_exist',
        message: 'User already exist.',
      },
    };
  }

  // minimum iterations
  if (payload.iterations && payload.iterations < 10000) {
    return {
      error: {
        code: 'iterations_too_low',
        message: 'PBKDF2 iterations amount too low.',
      },
    };
  }

  // Add user in user table
  const salt = generateSalt();
  const iterations = payload.iterations || 500000;
  const fileCollectionNonce = generateNonce();
  const settingsNonce = generateNonce();

  const user: UserItem = {
    id: nanoid(),
    salt: bufferToBase64(salt),
    iterations,
    fileCollectionNonce: bufferToBase64(fileCollectionNonce),
    settingsNonce: bufferToBase64(settingsNonce),
    username: payload.username,
  };

  if (users) {
    users.push(user);
  } else {
    users = [user];
  }

  await db.set(USERS_KEY, JSON.stringify(users));

  // Create an empty file collection
  const passwordKey = await getKeyFromDerivedPassword(payload.password, salt, true, iterations);

  const fileCollection: FileCollection = {
    userId: user.id,
    folders: [],
    notes: [],
  };

  const encryptedData = await encrypt(
    passwordKey,
    fileCollectionNonce,
    stringToBuffer(JSON.stringify(fileCollection)),
  );

  await db.set(`${FILE_COLLECTION_KEY}--${user.id}`, encryptedData);

  // Generate cloud sync password
  let cloudSyncPasswordKey;
  if (payload.enableCloudSync) {
    cloudSyncPasswordKey = await getKeyFromDerivedPassword(
      payload.password,
      stringToBuffer(payload.username),
      true,
      defaultCloudSyncPasswordIterations,
    );
  }

  return {
    user,
    passwordKey,
    cloudSyncPasswordKey,
    fileCollection,
  };
};

export default createNewUser;
