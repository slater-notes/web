import axios from 'axios';
import { defaultCloudSyncURL } from '../../config/cloudSync';
import { StandardResponse } from '../../types/response';
import { apiErrorToStandardError } from '../../utils/apiErrorToStandardError';

interface Payload {
  username: string;
  sessionToken: string;
  noteId: string;
  noteData: string;
}

const putNoteToCloudSync = async (payload: Payload): Promise<StandardResponse> => {
  let result;

  try {
    result = await axios.put(`${defaultCloudSyncURL}/note`, payload);
  } catch (error) {
    return apiErrorToStandardError(error);
  }

  return result.data;
};

export default putNoteToCloudSync;
