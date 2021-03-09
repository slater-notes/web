import { bufferToString, base64ToBuffer, decrypt, localDB, NoteData } from '@slater-notes/core';
import { ServiceResponse } from './services';

interface Response extends ServiceResponse {
  noteData?: NoteData;
}

const loadNoteData = async (
  db: localDB,
  noteId: string,
  nonce: string,
  passwordKey: CryptoKey,
): Promise<Response> => {
  const encryptedData = await db.get(noteId);

  if (!(encryptedData instanceof Uint8Array)) {
    return {
      error: {
        message: 'note does not exist',
      },
    };
  }

  let decryptedData;
  try {
    decryptedData = await decrypt(passwordKey, base64ToBuffer(nonce), encryptedData);
  } catch (_e) {
    return {
      error: {
        message: 'Bad decryption key.',
      },
    };
  }

  const noteData = JSON.parse(bufferToString(decryptedData));

  return { noteData };
};

export default loadNoteData;
