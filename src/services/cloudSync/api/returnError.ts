import { StandardError } from '../../../types/response';

export const returnError = (error: any): StandardError => {
  if (error.response) {
    return {
      error: error.response.data?.error
        ? error.response.data.error
        : error.response.status + error.response.statusText || '',
      errorCode: error.response.status,
    };
  } else {
    return { error: 'unknown error' };
  }
};
