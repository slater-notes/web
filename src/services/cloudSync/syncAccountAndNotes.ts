import {
  decrypt,
  stringToBuffer,
  bufferToString,
  encrypt,
  base64ToBuffer,
  UserItem,
  localDB,
  bufferToBase64,
} from '@slater-notes/core';
import { ErrorResult } from './api/types';
import getAccountFromCloudSync from './api/getAccount';
import updateAccountToCloudSync from './api/updateAccount';
import putNoteToCloudSync from './api/putNote';
import getNoteFromCloudSync from './api/getNote';
import saveNoteDataFromBase64 from '../local/saveNoteDataFromBase64';
import { eachLimit } from 'async';
import { debounce } from 'lodash';
import * as Workers from '../../services/webWorkers';
import { FileCollection, FolderItem, NoteItem } from '../../types/notes';
import { mergeArrayOfObjectsBy } from '../../utils/mergeArrayOfObject';

export interface Payload {
  sessionToken: string;
  user: UserItem;
  fileCollection: FileCollection;
  fileCollectionNonce: string;
  passwordKey: CryptoKey;
  cloudSyncPasswordKey: CryptoKey;
}

interface Result extends ErrorResult {
  success?: boolean;
  fileCollection?: FileCollection;
}

const syncAccountAndNotesToCloudSync = async (payload: Payload): Promise<Result> => {
  console.log('syncAccountAndNotesToCloudSync');
  // fetch from cloud
  const account = await getAccountFromCloudSync({
    username: payload.user.username,
    sessionToken: payload.sessionToken,
  });

  if (account.error || !account.fileCollection) {
    return { error: account.error || 'unknown error' };
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
  fileCollection.notes.forEach((noteItem) => {
    const localNoteItem = payload.fileCollection.notes.find((n) => n.id === noteItem.id);
    if (localNoteItem) {
      // we have this note in local, see if it's outdated
      if (localNoteItem.updated < noteItem.updated) {
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

  // download outdated and new noteData
  globalThis.localDB = globalThis.localDB || new localDB();
  const db = globalThis.localDB;

  await eachLimit(newOrOutdatedNoteIds, 2, async (noteId) => {
    const getNote = await getNoteFromCloudSync({
      username: payload.user.username,
      sessionToken: payload.sessionToken,
      noteId,
    });

    if (getNote.noteData) {
      await saveNoteDataFromBase64(db, noteId, getNote.noteData);
    }
  });

  // upload other noteData
  const otherNoteIds = mergedNotes
    .map((n) => n.id)
    .filter((id) => !newOrOutdatedNoteIds.includes(id));

  await eachLimit(otherNoteIds, 2, async (noteId) => {
    const encryptedNoteData = await db.get(noteId);
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

export const syncAccountAndNotesToCloudSyncWorkerized = async (
  workers: Workerized<typeof Workers>,
  payload: Payload,
) => {
  return await workers.worker__syncAccountAndNotesToCloudSync(payload);
};

export const syncAccountAndNotesToCloudSyncDebouncedWorkerized = debounce(
  syncAccountAndNotesToCloudSyncWorkerized,
  3000,
  { leading: false },
);

export default syncAccountAndNotesToCloudSync;
