import { base64ToBuffer } from '@slater-notes/core';
import disk from '../utils/disk';

const saveNoteDataFromBase64 = async (noteId: string, noteData: string) => {
  const dataArrayBuffer = base64ToBuffer(noteData);
  await disk.set(noteId, dataArrayBuffer);
};

export default saveNoteDataFromBase64;
