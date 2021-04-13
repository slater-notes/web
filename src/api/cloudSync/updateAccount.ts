import axios from 'axios';
import { defaultCloudSyncURL } from '../../config/cloudSync';
import { StandardResponse } from '../../types/response';
import { apiErrorToStandardError } from '../../utils/apiErrorToStandardError';

interface Payload {
  username: string;
  sessionToken: string;
  userItem: string;
  fileCollection: string;
}

const updateAccountToCloudSync = async (payload: Payload): Promise<StandardResponse> => {
  let result;

  try {
    result = await axios.post(`${defaultCloudSyncURL}/account`, payload);
  } catch (error) {
    return apiErrorToStandardError(error);
  }

  return result.data;
};

export default updateAccountToCloudSync;
