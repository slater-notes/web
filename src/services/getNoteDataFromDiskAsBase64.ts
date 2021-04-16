import { bufferToBase64 } from '@slater-notes/core';
import disk from '../utils/disk';

const getNoteDataFromDiskAsBase64 = async (noteId: string): Promise<string | null> => {
  const data = await disk.get(noteId);

  if (!(data instanceof Uint8Array)) {
    return null;
  }

  return bufferToBase64(data);
};

export default getNoteDataFromDiskAsBase64;
