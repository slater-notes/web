import { bufferToBase64 } from '@slater-notes/core';
import { FILE_COLLECTION_KEY } from '../utils/DBIndexKeys';
import disk from '../utils/disk';

const getFileCollectionFromDiskAsBase64 = async (userId: string): Promise<string | null> => {
  const encryptedData = await disk.get(`${FILE_COLLECTION_KEY}--${userId}`);

  if (!(encryptedData instanceof Uint8Array)) {
    return null;
  }

  return bufferToBase64(encryptedData);
};

export default getFileCollectionFromDiskAsBase64;
