import { localDB } from '@slater-notes/core';
import { ErrorResult } from './api/types';
import { eachLimit } from 'async';
import getNoteFromCloudSync from './api/getNote';
import saveNoteDataFromBase64 from '../local/saveNoteDataFromBase64';

interface Payload {
  username: string;
  sessionToken: string;
  db: localDB;
  noteIds: string[];
}

interface Result extends ErrorResult {
  success?: boolean;
}

const downloadNotesFromCloudSync = async (payload: Payload): Promise<Result> => {
  await eachLimit(payload.noteIds, 2, async (noteId) => {
    const result = await getNoteFromCloudSync({
      username: payload.username,
      sessionToken: payload.sessionToken,
      noteId,
    });

    if (result.noteData) {
      await saveNoteDataFromBase64(payload.db, noteId, result.noteData);
    }
  });

  return { success: true };
};

export default downloadNotesFromCloudSync;
