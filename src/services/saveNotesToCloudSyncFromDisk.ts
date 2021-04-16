import { eachLimit } from 'async';
import putNoteToCloudSync from '../api/cloudSync/putNote';
import getNoteDataFromDiskAsBase64 from './getNoteDataFromDiskAsBase64';
import { StandardResponse } from '../types/response';

interface Payload {
  username: string;
  sessionToken: string;
  noteIds: string[];
}

const saveNotesToCloudSyncFromDisk = async (payload: Payload): Promise<StandardResponse> => {
  await eachLimit(payload.noteIds, 2, async (noteId) => {
    const noteDataBase64 = await getNoteDataFromDiskAsBase64(noteId);

    if (noteDataBase64) {
      await putNoteToCloudSync({
        username: payload.username,
        sessionToken: payload.sessionToken,
        noteId: noteId,
        noteData: noteDataBase64,
      });
    }
  });

  return { success: true };
};

export default saveNotesToCloudSyncFromDisk;
