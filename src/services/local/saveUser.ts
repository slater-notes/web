import { localDB, UserItem } from '@slater-notes/core';
import { USERS_KEY } from '../../utils/DBIndexKeys';

const saveUser = async (db: localDB, userItem: UserItem) => {
  const usersJson = (await db.get(USERS_KEY)) as string | undefined;
  const users: UserItem[] = usersJson ? JSON.parse(usersJson) : [];
  const userIndex = users.findIndex((u) => u.username === userItem.username);

  if (userIndex > -1) {
    users[userIndex] = userItem;
  } else {
    users.push(userItem);
  }

  await db.set(USERS_KEY, JSON.stringify(users));
};

export default saveUser;
