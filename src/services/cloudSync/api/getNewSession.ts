import axios from 'axios';
import { defaultCloudSyncURL } from '../../../config/cloudSync';
import { ErrorResult, returnError } from './types';

interface Payload {
  username: string;
  token: string;
}

interface Result extends ErrorResult {
  sessionToken?: string;
}

const getNewSessionFromCloudSync = async (payload: Payload): Promise<Result> => {
  let result;

  try {
    result = await axios.post(`${defaultCloudSyncURL}/session`, payload);
  } catch (error) {
    return returnError(error);
  }

  return result.data;
};

export default getNewSessionFromCloudSync;
