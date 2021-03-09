export interface ErrorResult {
  error?: string;
  errorCode?: number;
}

export const returnError = (error: any): ErrorResult => {
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
