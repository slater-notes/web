import { localDB, UserItem } from '@slater-notes/core';
import { USERS_KEY } from '../../utils/DBIndexKeys';
import { ServiceResponse } from './services';

interface Response extends ServiceResponse {
  success?: boolean;
}

const changeUsername = async (
  db: localDB,
  userItem: UserItem,
  newUsername: string,
): Promise<Response> => {
  const usersJson = (await db.get(USERS_KEY)) as string | undefined;
  const users: UserItem[] = usersJson ? JSON.parse(usersJson) : [];

  if (users.findIndex((u) => u.username === newUsername) > -1) {
    return {
      error: {
        message: 'Username already in use',
      },
    };
  }

  const userIndex = users.findIndex((u) => u.username === userItem.username);

  if (users.length === 0 || userIndex < 0) {
    return {
      error: {
        code: 'no_user',
        message: 'No user with that username.',
      },
    };
  }

  users[userIndex].username = newUsername;

  await db.set(USERS_KEY, JSON.stringify(users));

  return { success: true };
};

export default changeUsername;
