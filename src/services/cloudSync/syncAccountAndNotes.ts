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
import { map } from 'bluebird';
import putNoteToCloudSync from './api/putNote';
import getNoteFromCloudSync from './api/getNote';
import saveNoteDataFromBase64 from '../local/saveNoteDataFromBase64';
import { eachLimit } from 'async';
import { debounce } from 'lodash';
import * as Workers from '../../services/webWorkers';
import { FileCollection, FolderItem, NoteItem } from '../../types/notes';

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

  let hasChange = false;

  // combine fileCollection.folders
  let newFileCollectionFolders: FolderItem[] = payload.fileCollection.folders.map((aFolder) => {
    const bIndex = fileCollection.folders.findIndex((f) => f.id === aFolder.id);
    if (bIndex > -1) {
      if (aFolder.updated === fileCollection.folders[bIndex].updated) {
        fileCollection.folders.splice(bIndex, 1);
      } else {
        hasChange = true;
        const mainFolder =
          aFolder.updated > fileCollection.folders[bIndex].updated
            ? aFolder
            : { ...fileCollection.folders[bIndex] };
        fileCollection.folders.splice(bIndex, 1);
        return mainFolder;
      }
    }

    return aFolder;
  });

  if (fileCollection.folders.length > 0) {
    hasChange = true;
    newFileCollectionFolders = [...newFileCollectionFolders, ...fileCollection.folders];
  }

  globalThis.localDB = globalThis.localDB || new localDB();
  const db = globalThis.localDB;

  // combine fileCollection.notes
  let newFileCollectionNotes: NoteItem[] = await map(
    payload.fileCollection.notes,
    async (aNote) => {
      const bIndex = fileCollection.notes.findIndex((n) => n.id === aNote.id);
      if (bIndex > -1) {
        if (aNote.updated === fileCollection.notes[bIndex].updated) {
          fileCollection.notes.splice(bIndex, 1);
        } else {
          const aIsUpdated = aNote.updated > fileCollection.notes[bIndex].updated;

          if (aIsUpdated) {
            // upload noteData
            const encryptedNoteData = await db.get(aNote.id);
            if (encryptedNoteData instanceof Uint8Array) {
              await putNoteToCloudSync({
                username: payload.user.username,
                sessionToken: payload.sessionToken,
                noteId: aNote.id,
                noteData: bufferToBase64(encryptedNoteData),
              });
            }
          } else {
            // download noteData
            const getNote = await getNoteFromCloudSync({
              username: payload.user.username,
              sessionToken: payload.sessionToken,
              noteId: aNote.id,
            });

            if (getNote.noteData) {
              await saveNoteDataFromBase64(db, aNote.id, getNote.noteData);
            }
          }

          hasChange = true;
          const mainNote = aIsUpdated ? aNote : { ...fileCollection.notes[bIndex] };
          fileCollection.notes.splice(bIndex, 1);
          return mainNote;
        }
      } else {
        // note does not exist in cloud sync, upload note data
        const encryptedNoteData = await db.get(aNote.id);
        if (encryptedNoteData instanceof Uint8Array) {
          await putNoteToCloudSync({
            username: payload.user.username,
            sessionToken: payload.sessionToken,
            noteId: aNote.id,
            noteData: bufferToBase64(encryptedNoteData),
          });
        }

        hasChange = true;
      }

      return aNote;
    },
    { concurrency: 2 },
  );

  if (fileCollection.notes.length > 0) {
    hasChange = true;
    newFileCollectionNotes = [...newFileCollectionNotes, ...fileCollection.notes];
  }

  // download any missing noteData from newFileCollectionNotes
  await eachLimit(newFileCollectionNotes, 2, async (noteItem) => {
    const check = await db.get(noteItem.id);

    if (!check) {
      const getNote = await getNoteFromCloudSync({
        username: payload.user.username,
        sessionToken: payload.sessionToken,
        noteId: noteItem.id,
      });

      if (getNote.noteData) {
        await saveNoteDataFromBase64(db, noteItem.id, getNote.noteData);
      }
    }
  });

  // if there's change, upload to cloud
  if (hasChange) {
    const newFileCollection = {
      ...payload.fileCollection,
      folders: newFileCollectionFolders,
      notes: newFileCollectionNotes,
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
  }

  return { success: true };
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
