import axios from 'axios';
import { defaultCloudSyncURL } from '../../config/cloudSync';
import { StandardError, StandardSuccess } from '../../types/response';
import { apiErrorToStandardError } from '../../utils/apiErrorToStandardError';

interface Payload {
  username: string;
  sessionToken: string;
}

interface SuccessResponse extends StandardSuccess {
  userItem: string;
  fileCollection: string;
}

const getAccountFromCloudSync = async (
  payload: Payload,
): Promise<SuccessResponse | StandardError> => {
  let result;

  try {
    result = await axios.get(`${defaultCloudSyncURL}/account`, {
      params: {
        username: payload.username,
        sessionToken: payload.sessionToken,
      },
    });
  } catch (error) {
    return apiErrorToStandardError(error);
  }

  return result.data;
};

export default getAccountFromCloudSync;
