import { UserItem } from '@slater-notes/core';
import { USERS_KEY } from '../utils/DBIndexKeys';
import disk from '../utils/disk';

const saveUser = async (userItem: UserItem) => {
  const usersJson = (await disk.get(USERS_KEY)) as string | undefined;
  const users: UserItem[] = usersJson ? JSON.parse(usersJson) : [];
  const userIndex = users.findIndex((u) => u.username === userItem.username);

  if (userIndex > -1) {
    users[userIndex] = userItem;
  } else {
    users.push(userItem);
  }

  await disk.set(USERS_KEY, JSON.stringify(users));
};

export default saveUser;
