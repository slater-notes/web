import { base64ToBuffer, localDB } from '@slater-notes/core';
import { ServiceResponse } from './services';

interface Response extends ServiceResponse {
  success?: boolean;
}

const saveNoteDataFromBase64 = async (
  db: localDB,
  noteId: string,
  noteData: string,
): Promise<Response> => {
  const dataArrayBuffer = base64ToBuffer(noteData);
  await db.set(noteId, dataArrayBuffer);

  return { success: true };
};

export default saveNoteDataFromBase64;
