import axios from 'axios';
import { defaultCloudSyncURL } from '../../../config/cloudSync';
import { ErrorResult, returnError } from './types';

interface Payload {
  username: string;
  sessionToken: string;
  noteId: string;
}

interface Result extends ErrorResult {
  success?: boolean;
  noteData?: string;
}

const getNoteFromCloudSync = async (payload: Payload): Promise<Result> => {
  let result;

  try {
    result = await axios.get(`${defaultCloudSyncURL}/note`, { params: payload });
  } catch (error) {
    return returnError(error);
  }

  return result.data;
};

export default getNoteFromCloudSync;
