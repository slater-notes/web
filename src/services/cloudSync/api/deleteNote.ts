import axios from 'axios';
import { defaultCloudSyncURL } from '../../../config/cloudSync';
import { StandardResponse } from '../../../types/response';
import { returnError } from './returnError';

interface Payload {
  username: string;
  sessionToken: string;
  noteId: string;
}

const deleteNoteFromCloudSync = async (payload: Payload): Promise<StandardResponse> => {
  let result;

  try {
    result = await axios.delete(`${defaultCloudSyncURL}/note`, { params: payload });
  } catch (error) {
    return returnError(error);
  }

  return result.data;
};

export default deleteNoteFromCloudSync;
