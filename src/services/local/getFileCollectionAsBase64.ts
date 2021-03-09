import { bufferToBase64, localDB } from '@slater-notes/core';
import { FILE_COLLECTION_KEY } from '../../utils/DBIndexKeys';

const getFileCollectionAsBase64 = async (db: localDB, userId: string): Promise<string | null> => {
  const encryptedData = await db.get(`${FILE_COLLECTION_KEY}--${userId}`);

  if (!(encryptedData instanceof Uint8Array)) {
    return null;
  }

  return bufferToBase64(encryptedData);
};

export default getFileCollectionAsBase64;
