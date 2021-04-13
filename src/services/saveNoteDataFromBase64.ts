import { base64ToBuffer, localDB } from '@slater-notes/core';

const saveNoteDataFromBase64 = async (db: localDB, noteId: string, noteData: string) => {
  const dataArrayBuffer = base64ToBuffer(noteData);
  await db.set(noteId, dataArrayBuffer);
};

export default saveNoteDataFromBase64;
