import { localDB, UserItem } from '@slater-notes/core';
import { USERS_KEY } from '../../utils/DBIndexKeys';
import { ServiceResponse } from './services';

interface Response extends ServiceResponse {
  success?: boolean;
}

const saveUser = async (db: localDB, userItem: UserItem): Promise<Response> => {
  const usersJson = (await db.get(USERS_KEY)) as string | undefined;
  const users: UserItem[] = usersJson ? JSON.parse(usersJson) : [];
  const userIndex = users.findIndex((u) => u.username === userItem.username);

  if (userIndex > -1) {
    users[userIndex] = userItem;
  } else {
    users.push(userItem);
  }

  await db.set(USERS_KEY, JSON.stringify(users));

  return { success: true };
};

export default saveUser;
