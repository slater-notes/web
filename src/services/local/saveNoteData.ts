import { base64ToBuffer, encrypt, localDB, stringToBuffer } from '@slater-notes/core';
import { NoteData } from '../../types/notes';

const saveNoteData = async (
  db: localDB,
  passwordKey: CryptoKey,
  nonce: string,
  noteData: NoteData,
) => {
  // Encrypt
  const json = JSON.stringify(noteData);
  const encryptedData = await encrypt(passwordKey, base64ToBuffer(nonce), stringToBuffer(json));

  // Save
  await db.set(noteData.id, new Uint8Array(encryptedData).valueOf());
};

export default saveNoteData;
