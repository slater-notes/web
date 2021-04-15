import {
  decrypt,
  stringToBuffer,
  bufferToString,
  encrypt,
  base64ToBuffer,
  UserItem,
  bufferToBase64,
} from '@slater-notes/core';
import getAccountFromCloudSync from '../api/cloudSync/getAccount';
import updateAccountToCloudSync from '../api/cloudSync/updateAccount';
import putNoteToCloudSync from '../api/cloudSync/putNote';
import { eachLimit } from 'async';
import { debounce } from 'lodash';
import { FileCollection, FolderItem, NoteItem } from '../types/notes';
import { mergeArrayOfObjectsBy } from '../utils/mergeArrayOfObject';
import { StandardError, StandardSuccess } from '../types/response';
import disk from '../utils/disk';
import downloadNotesFromCloudSync from './downloadNotesFromCloudSync';

export interface Payload {
  sessionToken: string;
  user: UserItem;
  fileCollection: FileCollection;
  fileCollectionNonce: string;
  passwordKey: CryptoKey;
  cloudSyncPasswordKey: CryptoKey;
}

interface SuccessResonse extends StandardSuccess {
  fileCollection: FileCollection;
}

const syncAccountAndNotesToCloudSync = async (
  payload: Payload,
): Promise<SuccessResonse | StandardError> => {
  console.log('syncAccountAndNotesToCloudSync');
  // fetch from cloud
  const account = await getAccountFromCloudSync({
    username: payload.user.username,
    sessionToken: payload.sessionToken,
  });

  if ('error' in account) {
    return { error: account.error };
  }

  // decrypt fileCollection
  let encryptedData;
  try {
    encryptedData = base64ToBuffer(account.fileCollection);
  } catch (e) {
    console.log(e);
    return { error: 'unknown error' };
  }

  let decryptedData;
  try {
    decryptedData = await decrypt(
      payload.passwordKey,
      base64ToBuffer(payload.user.fileCollectionNonce),
      encryptedData,
    );
  } catch (e) {
    console.log(e);
    return { error: 'bad decryption key' };
  }

  let fileCollection: FileCollection;
  try {
    fileCollection = JSON.parse(bufferToString(decryptedData));
  } catch (e) {
    console.log(e);
    return { error: 'unknown error' };
  }

  // merge fileCollection.folders
  const mergedFolders: FolderItem[] = mergeArrayOfObjectsBy(
    payload.fileCollection.folders,
    fileCollection.folders,
    'id',
    'updated',
  );

  // merge fileCollection.notes
  const newOrOutdatedNoteIds: string[] = [];

  // loop through notes from cloud storage
  await eachLimit(fileCollection.notes, 1, async (noteItem) => {
    const localNoteItem = payload.fileCollection.notes.find((n) => n.id === noteItem.id);
    if (localNoteItem) {
      // we have record of this note, see if it's outdated
      // or if it doesn't have noteData on disk
      const encryptedNoteData = await disk.get(noteItem.id);

      if (localNoteItem.updated < noteItem.updated || !encryptedNoteData) {
        newOrOutdatedNoteIds.push(noteItem.id);
      }
    } else {
      // we don't have this note in out local
      newOrOutdatedNoteIds.push(noteItem.id);
    }
  });

  const mergedNotes: NoteItem[] = mergeArrayOfObjectsBy(
    payload.fileCollection.notes,
    fileCollection.notes,
    'id',
    'updated',
  );

  // download new and outdated noteData
  await downloadNotesFromCloudSync({
    username: payload.user.username,
    sessionToken: payload.sessionToken,
    noteIds: newOrOutdatedNoteIds,
  });

  // upload other noteData
  const otherNoteIds = mergedNotes
    .map((n) => n.id)
    .filter((id) => !newOrOutdatedNoteIds.includes(id));

  await eachLimit(otherNoteIds, 2, async (noteId) => {
    const encryptedNoteData = await disk.get(noteId);
    if (encryptedNoteData instanceof Uint8Array) {
      await putNoteToCloudSync({
        username: payload.user.username,
        sessionToken: payload.sessionToken,
        noteId: noteId,
        noteData: bufferToBase64(encryptedNoteData),
      });
    }
  });

  // create a new fileCollection object
  const newFileCollection = {
    ...payload.fileCollection,
    folders: mergedFolders,
    notes: mergedNotes,
  };

  // encrypt fileCollection and output as base64
  const fileCollectionJson = JSON.stringify(newFileCollection);
  const fileCollecitonEnc = await encrypt(
    payload.passwordKey,
    base64ToBuffer(payload.fileCollectionNonce),
    stringToBuffer(fileCollectionJson),
  );

  const fileCollectionDataBase64 = bufferToBase64(fileCollecitonEnc);

  // encrypt userItem and output as base64
  const userItemJson = JSON.stringify(payload.user);
  const userItemEnc = await encrypt(
    payload.cloudSyncPasswordKey,
    stringToBuffer(payload.user.username),
    stringToBuffer(userItemJson),
  );

  const userItemDataBase64 = bufferToBase64(userItemEnc);

  const update = await updateAccountToCloudSync({
    username: payload.user.username,
    sessionToken: payload.sessionToken,
    userItem: userItemDataBase64,
    fileCollection: fileCollectionDataBase64,
  });

  return {
    ...update,
    fileCollection: newFileCollection,
  };
};

export const runSyncAccountAndNotesToCloudSyncInWorker = async (payload: Payload) => {
  return await globalThis.webWorkers.worker__syncAccountAndNotesToCloudSync(payload);
};

export const syncAccountAndNotesToCloudSyncDebouncedWorker = debounce(
  runSyncAccountAndNotesToCloudSyncInWorker,
  3000,
  { leading: false },
);

export default syncAccountAndNotesToCloudSync;