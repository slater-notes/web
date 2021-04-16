import { base64ToBuffer, encrypt, stringToBuffer } from '@slater-notes/core';
import { NoteData } from '../types/notes';
import disk from '../utils/disk';

const saveNoteDataToDisk = async (passwordKey: CryptoKey, nonce: string, noteData: NoteData) => {
  // Encrypt
  const json = JSON.stringify(noteData);
  const encryptedData = await encrypt(passwordKey, base64ToBuffer(nonce), stringToBuffer(json));

  // Save
  await disk.set(noteData.id, new Uint8Array(encryptedData).valueOf());
};

export default saveNoteDataToDisk;
