import { eachLimit } from 'async';
import putNote from '../api/cloudSync/putNote';
import getNoteDataFromDiskAsBase64 from './getNoteDataFromDiskAsBase64';
import { StandardResponse } from '../types/response';

interface Payload {
  username: string;
  sessionToken: string;
  noteIds: string[];
}

const saveNotesToCloudSyncFromDisk = async (payload: Payload): Promise<StandardResponse> => {
  await eachLimit(payload.noteIds, 2, async (noteId) => {
    const noteData = await getNoteDataFromDiskAsBase64(noteId);

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

export default saveNotesToCloudSyncFromDisk;
