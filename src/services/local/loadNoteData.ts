import { bufferToString, base64ToBuffer, decrypt, localDB } from '@slater-notes/core';
import { NoteData } from '../../types/notes';
import { StandardError } from '../../types/response';

type SuccessResponse = {
  noteData: NoteData;
};

type Response = SuccessResponse | StandardError;

const loadNoteData = async (
  db: localDB,
  noteId: string,
  nonce: string,
  passwordKey: CryptoKey,
): Promise<Response> => {
  const encryptedData = await db.get(noteId);

  if (!(encryptedData instanceof Uint8Array)) {
    return {
      error: 'note does not exist',
    };
  }

  let decryptedData;
  try {
    decryptedData = await decrypt(passwordKey, base64ToBuffer(nonce), encryptedData);
  } catch (_e) {
    return {
      error: 'Bad decryption key.',
    };
  }

  const noteData: NoteData = JSON.parse(bufferToString(decryptedData));

  // Make sure our noteData.revisions consist of the correct object,
  // otherwise just overwrite it with empty array.
  if (noteData.revisions.length > 0 && typeof noteData.revisions[0].content == 'undefined') {
    noteData.revisions = [];
  }

  return { noteData };
};

export default loadNoteData;
