export type StandardResponse = StandardSuccess | StandardError;

export type StandardSuccess = {
  success: true;
};

export type StandardError = {
  errorCode?: string | number;
  error: string;
};
