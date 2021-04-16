import { UserItem } from '@slater-notes/core';
import { StandardResponse } from '../types/response';
import { USERS_KEY } from '../utils/DBIndexKeys';
import disk from '../utils/disk';
import getAllUserItemsFromDisk from './getAllUserItemsFromDisk';

const changeUsernameOnDisk = async (
  userItem: UserItem,
  newUsername: string,
): Promise<StandardResponse> => {
  const users = await getAllUserItemsFromDisk();

  if (users.findIndex((u) => u.username === newUsername) > -1) {
    return { error: 'Username already in use' };
  }

  const userIndex = users.findIndex((u) => u.username === userItem.username);

  if (users.length === 0 || userIndex < 0) {
    return { errorCode: 'no_user', error: 'No user with that username.' };
  }

  users[userIndex].username = newUsername;

  await disk.set(USERS_KEY, JSON.stringify(users));

  return { success: true };
};

export default changeUsernameOnDisk;
