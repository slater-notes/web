export type StandardResponse = StandardSuccess | StandardError;

export type StandardSuccess = {
  success: boolean;
};

export type StandardError = {
  errorCode?: string | number;
  error: string;
};
