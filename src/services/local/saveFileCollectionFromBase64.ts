import { base64ToBuffer, localDB, UserItem } from '@slater-notes/core';
import { FILE_COLLECTION_KEY } from '../../utils/DBIndexKeys';
import { ServiceResponse } from './services';

interface Response extends ServiceResponse {
  success?: boolean;
}

const saveFileCollectionFromBase64 = async (
  db: localDB,
  user: UserItem,
  fileCollectionData: string,
): Promise<Response> => {
  const fileCollectionArrayBuffer = base64ToBuffer(fileCollectionData);
  await db.set(`${FILE_COLLECTION_KEY}--${user.id}`, fileCollectionArrayBuffer);

  return { success: true };
};

export default saveFileCollectionFromBase64;
