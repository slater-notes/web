import { base64ToBuffer, encrypt, localDB, stringToBuffer, UserItem } from '@slater-notes/core';
import { FileCollection } from '../../types/notes';
import { FILE_COLLECTION_KEY } from '../../utils/DBIndexKeys';

const saveFileCollection = async (
  db: localDB,
  user: UserItem,
  passwordKey: CryptoKey,
  fileCollection: FileCollection,
) => {
  // Encrypt
  const json = JSON.stringify(fileCollection);
  const encryptedData = await encrypt(
    passwordKey,
    base64ToBuffer(user.fileCollectionNonce),
    stringToBuffer(json),
  );

  // Save
  await db.set(`${FILE_COLLECTION_KEY}--${user.id}`, new Uint8Array(encryptedData).valueOf());
};

export default saveFileCollection;
