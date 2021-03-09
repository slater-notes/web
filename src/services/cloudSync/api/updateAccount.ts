import axios from 'axios';
import { defaultCloudSyncURL } from '../../../config/cloudSync';
import { ErrorResult, returnError } from './types';

interface Payload {
  username: string;
  sessionToken: string;
  userItem: string;
  fileCollection: string;
}

interface Result extends ErrorResult {
  success?: boolean;
}

const updateAccountToCloudSync = async (payload: Payload): Promise<Result> => {
  let result;

  try {
    result = await axios.post(`${defaultCloudSyncURL}/account`, payload);
  } catch (error) {
    return returnError(error);
  }

  return result.data;
};

export default updateAccountToCloudSync;
