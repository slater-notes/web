import { eachLimit } from 'async';
import getNoteFromCloudSync from '../api/cloudSync/getNote';
import saveNoteDataFromBase64 from './saveNoteDataFromBase64';
import { StandardResponse } from '../types/response';

interface Payload {
  username: string;
  sessionToken: string;
  noteIds: string[];
}

const downloadNotesFromCloudSync = async (payload: Payload): Promise<StandardResponse> => {
  await eachLimit(payload.noteIds, 2, async (noteId) => {
    const result = await getNoteFromCloudSync({
      username: payload.username,
      sessionToken: payload.sessionToken,
      noteId,
    });

    if ('success' in result && result.success) {
      await saveNoteDataFromBase64(noteId, result.noteData);
    }
  });

  return { success: true };
};

export default downloadNotesFromCloudSync;
