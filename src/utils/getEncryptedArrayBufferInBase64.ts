import { bufferToString, encrypt, stringToBuffer, stringToBase64 } from '@slater-notes/core';

const getEncryptedArrayBufferInBase64 = async (
  data: ArrayBuffer,
  passwordKey: CryptoKey,
  salt: string,
) => {
  const json = JSON.stringify(data);
  const encryptedData = await encrypt(passwordKey, stringToBuffer(salt), stringToBuffer(json));

  return stringToBase64(bufferToString(encryptedData));
};

export default getEncryptedArrayBufferInBase64;
