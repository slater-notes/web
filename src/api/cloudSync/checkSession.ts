import axios from 'axios';
import { defaultCloudSyncURL } from '../../config/cloudSync';
import { StandardResponse } from '../../types/response';
import { apiErrorToStandardError } from '../../utils/apiErrorToStandardError';

interface Payload {
  username: string;
  sessionToken: string;
}

const checkSessionFromCloudSync = async (payload: Payload): Promise<StandardResponse> => {
  let result;

  try {
    result = await axios.get(`${defaultCloudSyncURL}/session`, {
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

export default checkSessionFromCloudSync;
