import { UserItem } from '@slater-notes/core';
import { USERS_KEY } from '../utils/DBIndexKeys';
import disk from '../utils/disk';

const getAllUserItemsFromDisk = async () => {
  const usersJson = (await disk.get(USERS_KEY)) as string | undefined;
  const users: UserItem[] = usersJson ? JSON.parse(usersJson) : [];
  return users;
};

export default getAllUserItemsFromDisk;
