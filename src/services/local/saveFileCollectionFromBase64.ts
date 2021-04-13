import { base64ToBuffer, localDB, UserItem } from '@slater-notes/core';
import { FILE_COLLECTION_KEY } from '../../utils/DBIndexKeys';

const saveFileCollectionFromBase64 = async (
  db: localDB,
  user: UserItem,
  fileCollectionData: string,
) => {
  const fileCollectionArrayBuffer = base64ToBuffer(fileCollectionData);
  await db.set(`${FILE_COLLECTION_KEY}--${user.id}`, fileCollectionArrayBuffer);
};

export default saveFileCollectionFromBase64;
