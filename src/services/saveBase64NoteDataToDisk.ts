import { base64ToBuffer } from '@slater-notes/core';
import disk from '../utils/disk';

const saveBase64NoteDataToDisk = async (noteId: string, noteData: string) => {
  const dataArrayBuffer = base64ToBuffer(noteData);
  await disk.set(noteId, dataArrayBuffer);
};

export default saveBase64NoteDataToDisk;
