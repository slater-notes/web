// Jest Unit test polyfill: https://github.com/facebook/jest/issues/9983
import { TextEncoder, TextDecoder } from 'util';

export const addPolyfill = () => {
  window.TextEncoder = TextEncoder as any;
  window.TextDecoder = TextDecoder as any;
};
