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
import { eachLimit } from 'async';
import { debounce } from 'lodash';
import { FileCollection, FolderItem, NoteItem } from '../types/notes';
import { mergeArrayOfObjectsBy } from '../utils/mergeArrayOfObject';
import { StandardError, StandardSuccess } from '../types/response';
import disk from '../utils/disk';
import getNotesFromCloudSyncAndSaveToDisk from './getNotesFromCloudSyncAndSaveToDisk';
import saveNotesToCloudSyncFromDisk from './saveNotesToCloudSyncFromDisk';

export interface Payload {
  sessionToken: string;
  user: UserItem;
  upstreamFileCollection?: FileCollection;
  localFileCollection?: FileCollection;
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

  // Fetch fileCollection from server if `upstreamFileCollection` is not provided
  let { upstreamFileCollection } = payload;

  if (!upstreamFileCollection) {
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

    try {
      upstreamFileCollection = JSON.parse(bufferToString(decryptedData)) as FileCollection;
    } catch (e) {
      console.error(e);
      return { error: 'unknown error' };
    }
  }

  // merge fileCollection.folders
  const mergedFolders: FolderItem[] = mergeArrayOfObjectsBy(
    payload.localFileCollection?.folders || [],
    upstreamFileCollection.folders,
    'id',
    'updated',
  );

  // merge fileCollection.notes
  const mergedNotes: NoteItem[] = mergeArrayOfObjectsBy(
    payload.localFileCollection?.notes || [],
    upstreamFileCollection.notes,
    'id',
    'updated',
  );

  // check each notes are up-to-date
  const newOrOutdatedNoteIds: string[] = [];

  await eachLimit(upstreamFileCollection.notes, 1, async (upstreamNoteItem) => {
    const localNoteItem = payload.localFileCollection?.notes.find(
      (n) => n.id === upstreamNoteItem.id,
    );

    if (localNoteItem) {
      const encryptedNoteData = await disk.get(upstreamNoteItem.id);
      if (encryptedNoteData && localNoteItem.updated >= upstreamNoteItem.updated) return;
    }

    // this note is outdated or it has missing noteData in local
    newOrOutdatedNoteIds.push(upstreamNoteItem.id);
  });

  // download new and outdated noteData
  await getNotesFromCloudSyncAndSaveToDisk({
    username: payload.user.username,
    sessionToken: payload.sessionToken,
    noteIds: newOrOutdatedNoteIds,
  });

  // upload other noteData
  const otherNoteIds = mergedNotes
    .map((n) => n.id)
    .filter((id) => !newOrOutdatedNoteIds.includes(id));

  saveNotesToCloudSyncFromDisk({
    username: payload.user.username,
    sessionToken: payload.sessionToken,
    noteIds: otherNoteIds,
  });

  // create a new fileCollection object
  const newFileCollection = {
    userId: payload.user.id,
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
