import { eachLimit } from 'async';
import getNoteFromCloudSync from '../api/cloudSync/getNote';
import saveBase64NoteDataToDisk from './saveBase64NoteDataToDisk';
import { StandardResponse } from '../types/response';

interface Payload {
  username: string;
  sessionToken: string;
  noteIds: string[];
}

const getNotesFromCloudSyncAndSaveToDisk = async (payload: Payload): Promise<StandardResponse> => {
  await eachLimit(payload.noteIds, 2, async (noteId) => {
    const result = await getNoteFromCloudSync({
      username: payload.username,
      sessionToken: payload.sessionToken,
      noteId,
    });

    if ('success' in result && result.success) {
      await saveBase64NoteDataToDisk(noteId, result.noteData);
    }
  });

  return { success: true };
};

export default getNotesFromCloudSyncAndSaveToDisk;
