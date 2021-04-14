import { useState } from 'react';
import { StandardError } from '../types/response';

const useLoading = (
  defaultIsLoading?: boolean,
): [
  boolean,
  ErrorOrNull,
  boolean,
  (isLoading: boolean) => void,
  (error: ErrorOrNull) => void,
  (isComplete: boolean) => void,
  () => void,
] => {
  const [isLoading, setIsLoading] = useState(defaultIsLoading || false);
  const [error, setError] = useState<ErrorOrNull>(null);
  const [isComplete, setIsComplete] = useState(false);

  const doSetError = (e: ErrorOrNull) => {
    setError(e);
    setIsLoading(false);
  };

  const doSetIsComplete = (isComplete: boolean) => {
    setIsComplete(isComplete);
    if (isComplete) setIsLoading(false);
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setIsComplete(false);
  };

  return [isLoading, error, isComplete, setIsLoading, doSetError, doSetIsComplete, reset];
};

export type ErrorOrNull = StandardError | null;

export default useLoading;
