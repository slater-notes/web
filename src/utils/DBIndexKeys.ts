export const getFileCollectionDBIndexKey = (userId: string) => {
  return `file-collection--${userId}`;
};

export const getUserDBIndexKey = (userId: string) => {
  return `user--${userId}`;
};

export const USERS_KEY = 'users';
export const FILE_COLLECTION_KEY = 'file-collection';
export const SETTINGS_KEY = 'settings';
