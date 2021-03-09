import { base64ToBuffer, encrypt, localDB, NoteData, stringToBuffer } from '@slater-notes/core';
import { ServiceResponse } from './services';

interface Response extends ServiceResponse {
  success?: boolean;
}

const saveNoteData = async (
  db: localDB,
  passwordKey: CryptoKey,
  nonce: string,
  noteData: NoteData,
): Promise<Response> => {
  // Encrypt
  const json = JSON.stringify(noteData);
  const encryptedData = await encrypt(passwordKey, base64ToBuffer(nonce), stringToBuffer(json));

  // Save
  await db.set(noteData.id, new Uint8Array(encryptedData).valueOf());

  return { success: true };
};

export default saveNoteData;
