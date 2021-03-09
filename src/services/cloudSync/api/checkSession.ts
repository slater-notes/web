import axios from 'axios';
import { defaultCloudSyncURL } from '../../../config/cloudSync';
import { ErrorResult, returnError } from './types';

interface Payload {
  username: string;
  sessionToken: string;
}

interface Result extends ErrorResult {
  success?: boolean;
}

const checkSessionFromCloudSync = async (payload: Payload): Promise<Result> => {
  let result;

  try {
    result = await axios.get(`${defaultCloudSyncURL}/session`, {
      params: {
        username: payload.username,
        sessionToken: payload.sessionToken,
      },
    });
  } catch (error) {
    return returnError(error);
  }

  return result.data;
};

export default checkSessionFromCloudSync;
