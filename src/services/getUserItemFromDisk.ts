import getAllUserItemsFromDisk from './getAllUserItemsFromDisk';

const getUserItemFromDisk = async (username: string) => {
  const users = await getAllUserItemsFromDisk();
  const user = users.find((u) => u.username === username);

  return user || null;
};

export default getUserItemFromDisk;
