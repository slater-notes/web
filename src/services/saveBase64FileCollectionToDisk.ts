import { base64ToBuffer, UserItem } from '@slater-notes/core';
import { FILE_COLLECTION_KEY } from '../utils/DBIndexKeys';
import disk from '../utils/disk';

const saveBase64FileCollectionToDisk = async (user: UserItem, fileCollectionData: string) => {
  const fileCollectionArrayBuffer = base64ToBuffer(fileCollectionData);
  await disk.set(`${FILE_COLLECTION_KEY}--${user.id}`, fileCollectionArrayBuffer);
};

export default saveBase64FileCollectionToDisk;
