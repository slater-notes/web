import axios from 'axios';
import { defaultCloudSyncURL } from '../../config/cloudSync';
import { StandardError, StandardSuccess } from '../../types/response';
import { apiErrorToStandardError } from '../../utils/apiErrorToStandardError';

interface Payload {
  username: string;
  token: string;
}

interface SuccessResponse extends StandardSuccess {
  sessionToken: string;
}

const getNewSessionFromCloudSync = async (
  payload: Payload,
): Promise<SuccessResponse | StandardError> => {
  let result;

  try {
    result = await axios.post(`${defaultCloudSyncURL}/session`, payload);
  } catch (error) {
    return apiErrorToStandardError(error);
  }

  return result.data;
};

export default getNewSessionFromCloudSync;
