import axios from 'axios';
import { defaultCloudSyncURL } from '../../config/cloudSync';
import { StandardError, StandardSuccess } from '../../types/response';
import { apiErrorToStandardError } from '../../utils/apiErrorToStandardError';

interface Payload {
  username: string;
  sessionToken: string;
  noteId: string;
}

interface SuccessResponse extends StandardSuccess {
  noteData: string;
}

const getNoteFromCloudSync = async (payload: Payload): Promise<SuccessResponse | StandardError> => {
  let result;

  try {
    result = await axios.get(`${defaultCloudSyncURL}/note`, { params: payload });
  } catch (error) {
    return apiErrorToStandardError(error);
  }

  return result.data;
};

export default getNoteFromCloudSync;
