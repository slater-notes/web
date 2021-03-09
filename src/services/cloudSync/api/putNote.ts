import axios from 'axios';
import { defaultCloudSyncURL } from '../../../config/cloudSync';
import { ErrorResult, returnError } from './types';

interface Payload {
  username: string;
  sessionToken: string;
  noteId: string;
  noteData: string;
}

interface Result extends ErrorResult {
  success?: boolean;
}

const putNoteToCloudSync = async (payload: Payload): Promise<Result> => {
  let result;

  try {
    result = await axios.put(`${defaultCloudSyncURL}/note`, payload);
  } catch (error) {
    return returnError(error);
  }

  return result.data;
};

export default putNoteToCloudSync;
