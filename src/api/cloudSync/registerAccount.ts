import axios from 'axios';
import { defaultCloudSyncURL } from '../../config/cloudSync';
import { StandardError, StandardSuccess } from '../../types/response';
import { apiErrorToStandardError } from '../../utils/apiErrorToStandardError';

interface Payload {
  username: string;
  token: string;
  userItem: string;
  fileCollection: string;
}

interface SuccessResponse extends StandardSuccess {
  sessionToken: string;
}

const registerToCloudSync = async (payload: Payload): Promise<SuccessResponse | StandardError> => {
  let result;

  try {
    result = await axios.put(`${defaultCloudSyncURL}/account`, payload);
  } catch (error) {
    return apiErrorToStandardError(error);
  }

  return result.data;
};

export default registerToCloudSync;
