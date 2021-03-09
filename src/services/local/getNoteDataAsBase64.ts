import { bufferToBase64, localDB } from '@slater-notes/core';

const getNoteDataAsBase64 = async (db: localDB, noteId: string): Promise<string | null> => {
  const data = await db.get(noteId);

  if (!(data instanceof Uint8Array)) {
    return null;
  }

  return bufferToBase64(data);
};

export default getNoteDataAsBase64;
