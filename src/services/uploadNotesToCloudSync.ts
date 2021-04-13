import { localDB } from '@slater-notes/core';
import { eachLimit } from 'async';
import putNote from '../api/cloudSync/putNote';
import getNoteDataAsBase64 from './getNoteDataAsBase64';
import { StandardResponse } from '../types/response';

interface Payload {
  username: string;
  sessionToken: string;
  db: localDB;
  noteIds: string[];
}

const uploadNotesToCloudSync = async (payload: Payload): Promise<StandardResponse> => {
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
