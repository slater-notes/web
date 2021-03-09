import { bufferToString, encrypt, stringToBuffer, stringToBase64 } from '@slater-notes/core';

const getEncryptedDataInBase64 = async (data: Object, passwordKey: CryptoKey, salt: string) => {
  const json = JSON.stringify(data);
  const encryptedData = await encrypt(passwordKey, stringToBuffer(salt), stringToBuffer(json));

  return stringToBase64(bufferToString(encryptedData));
};

export default getEncryptedDataInBase64;
