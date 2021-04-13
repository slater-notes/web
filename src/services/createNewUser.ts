import { nanoid } from 'nanoid';
import {
  encrypt,
  generateNonce,
  generateSalt,
  getKeyFromDerivedPassword,
  stringToBuffer,
  bufferToBase64,
  UserItem,
} from '@slater-notes/core';
import { FILE_COLLECTION_KEY, USERS_KEY } from '../utils/DBIndexKeys';
import { FileCollection } from '../types/notes';
import { defaultCloudSyncPasswordIterations } from '../config/cloudSync';
import { StandardError } from '../types/response';
import disk from '../utils/disk';

interface Payload {
  username: string;
  password: string;
  enableCloudSync?: boolean;
  iterations?: number;
}

type SuccessResponse = {
  success: true;
  user: UserItem;
  passwordKey: CryptoKey;
  cloudSyncPasswordKey: CryptoKey;
  fileCollection: FileCollection;
};

const createNewUser = async (payload: Payload): Promise<SuccessResponse | StandardError> => {
  const usersJson = (await disk.get(USERS_KEY)) as string | undefined;
  let users: UserItem[] = usersJson ? JSON.parse(usersJson) : [];

  // check that this user does not exist
  if (users && users.findIndex((u) => u.username === payload.username) > -1) {
    return {
      errorCode: 'user_exist',
      error: 'User already exist.',
    };
  }

  // minimum iterations
  if (payload.iterations && payload.iterations < 10000) {
    return {
      errorCode: 'iterations_too_low',
      error: 'PBKDF2 iterations amount too low.',
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

  await disk.set(USERS_KEY, JSON.stringify(users));

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

  await disk.set(`${FILE_COLLECTION_KEY}--${user.id}`, encryptedData);

  // Generate cloud sync password
  const cloudSyncPasswordKey = await getKeyFromDerivedPassword(
    payload.password,
    stringToBuffer(payload.username),
    true,
    defaultCloudSyncPasswordIterations,
  );

  return {
    success: true,
    user,
    passwordKey,
    cloudSyncPasswordKey,
    fileCollection,
  };
};

export default createNewUser;
