import { localDB } from '@slater-notes/core';
import { ErrorResult } from './api/types';
import { eachLimit } from 'async';
import putNote from './api/putNote';
import getNoteDataAsBase64 from '../local/getNoteDataAsBase64';

interface Payload {
  username: string;
  sessionToken: string;
  db: localDB;
  noteIds: string[];
}

interface Result extends ErrorResult {
  success?: boolean;
}

const uploadNotesToCloudSync = async (payload: Payload): Promise<Result> => {
  await eachLimit(payload.noteIds, 2, async (noteId) => {
    const noteData = await getNoteDataAsBase64(payload.db, noteId);

    if (!noteData) {
      // TODO: show error?
      return;
    }

    await putNote({
      username: payload.username,
      sessionToken: payload.sessionToken,
      noteId: noteId,
      noteData,
    });
  });

  return { success: true };
};

export default uploadNotesToCloudSync;
