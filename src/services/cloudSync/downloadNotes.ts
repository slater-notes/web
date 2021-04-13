import { localDB } from '@slater-notes/core';
import { eachLimit } from 'async';
import getNoteFromCloudSync from './api/getNote';
import saveNoteDataFromBase64 from '../local/saveNoteDataFromBase64';
import { StandardResponse } from '../../types/response';

interface Payload {
  username: string;
  sessionToken: string;
  db: localDB;
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
      await saveNoteDataFromBase64(payload.db, noteId, result.noteData);
    }
  });

  return { success: true };
};

export default downloadNotesFromCloudSync;
