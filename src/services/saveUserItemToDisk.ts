import { UserItem } from '@slater-notes/core';
import { USERS_KEY } from '../utils/DBIndexKeys';
import disk from '../utils/disk';
import getAllUserItemsFromDisk from './getAllUserItemsFromDisk';

const saveUserItemToDisk = async (userItem: UserItem) => {
  const users = await getAllUserItemsFromDisk();
  const userIndex = users.findIndex((u) => u.username === userItem.username);

  if (userIndex > -1) {
    users[userIndex] = userItem;
  } else {
    users.push(userItem);
  }

  await disk.set(USERS_KEY, JSON.stringify(users));
};

export default saveUserItemToDisk;
