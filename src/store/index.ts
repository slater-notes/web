import { action, Action, thunk, Thunk } from 'easy-peasy';
import moment from 'moment';
import { nanoid } from 'nanoid';
import {
  localDB,
  UserItem,
  generateNonce,
  encrypt,
  stringToBuffer,
  bufferToBase64,
  base64ToBuffer,
} from '@slater-notes/core';
import loadNoteData from '../services/local/loadNoteData';
import saveFileCollection from '../services/local/saveFileCollection';
import saveNoteData from '../services/local/saveNoteData';
import saveUserSettings from '../services/local/saveUserSettings';
import { FILE_COLLECTION_KEY } from '../utils/DBIndexKeys';
import { log } from '../utils/log';
import { UserSettingsOptions } from '../config/defaultUserSettings';
import saveUser from '../services/local/saveUser';
import { syncAccountAndNotesToCloudSyncDebouncedWorkerized } from '../services/cloudSync/syncAccountAndNotes';
import { AppSettingsOptions } from '../config/defaultAppSettings';
import saveAppSettings from '../services/local/saveAppSettings';
import * as Workers from '../services/webWorkers';
import { FileCollection, FolderItem, NoteData, NoteItem } from '../types/notes';

export interface StoreModel {
  localDB: localDB | null;
  setLocalDB: Action<StoreModel, localDB>;

  workers: Workerized<typeof Workers> | null;
  setWorkers: Action<StoreModel, Workerized<typeof Workers>>;

  user: UserItem | null;
  setUser: Action<StoreModel, UserItem | null>;

  passwordKey: CryptoKey | null;
  setPasswordKey: Action<StoreModel, CryptoKey | null>;

  cloudSyncPasswordKey: CryptoKey | null;
  setCloudSyncPasswordKey: Action<StoreModel, CryptoKey | null>;

  fileCollection: FileCollection | null;
  setFileCollection: Action<StoreModel, FileCollection | null>;

  settings: Partial<UserSettingsOptions> | null;
  setSettings: Action<StoreModel, Partial<UserSettingsOptions> | null>;

  appSettings: Partial<AppSettingsOptions> | null;
  setAppSettings: Action<StoreModel, Partial<AppSettingsOptions> | null>;

  sidebarOpen: boolean;
  setSidebarOpen: Action<StoreModel, boolean>;

  activeNote: { noteItem: NoteItem; noteData: NoteData } | null;
  setActiveNote: Action<StoreModel, { noteItem: NoteItem; noteData: NoteData } | null>;

  activeFolderId: string;
  setActiveFolderId: Action<StoreModel, string>;
  resetActiveFolder: Action<StoreModel>;
  resetFolderIdIfActive: Action<StoreModel, string>;

  editingFolderId: string | null;
  setEditingFolderId: Action<StoreModel, string | null>;

  updateUser: Thunk<StoreModel, { userItem: UserItem; noCloudSync?: boolean }>;
  updateFileCollection: Thunk<StoreModel, FileCollection>;
  updateSettings: Thunk<StoreModel, Partial<UserSettingsOptions>>;
  updateAppSettings: Thunk<StoreModel, Partial<AppSettingsOptions>>;
  createNewNote: Thunk<StoreModel, { title: string; parentId?: string }>;
  createNewFolder: Thunk<StoreModel, { title: string; editOnCreate?: boolean }>;
  loadNote: Thunk<StoreModel, NoteItem>;
  updateNoteItem: Thunk<StoreModel, { id: string; noteItem: NoteItem }>;
  updateNoteData: Thunk<StoreModel, { id: string; noteData: NoteData }>;
  updateFolder: Thunk<StoreModel, { id: string; folder: FolderItem }>;
  trashNote: Thunk<StoreModel, string>;
  trashFolder: Thunk<StoreModel, string>;
  emptyTrash: Thunk<StoreModel>;
  permanentlyDeleteNote: Thunk<StoreModel, string>;
  permanentlyDeleteFolder: Thunk<StoreModel, string>;
}

const ApplicationStore: StoreModel = {
  localDB: null,
  setLocalDB: action((state, payload) => {
    state.localDB = payload;
  }),

  workers: null,
  setWorkers: action((state, payload) => {
    state.workers = payload;
  }),

  user: null,
  setUser: action((state, payload) => {
    state.user = payload;
  }),

  passwordKey: null,
  setPasswordKey: action((state, payload) => {
    state.passwordKey = payload;
  }),

  cloudSyncPasswordKey: null,
  setCloudSyncPasswordKey: action((state, payload) => {
    state.cloudSyncPasswordKey = payload;
  }),

  fileCollection: null,
  setFileCollection: action((state, payload) => {
    state.fileCollection = payload;
  }),

  settings: null,
  setSettings: action((state, payload) => {
    state.settings = { ...state.settings, ...payload };
  }),

  appSettings: null,
  setAppSettings: action((state, payload) => {
    state.appSettings = { ...state.appSettings, ...payload };
  }),

  sidebarOpen: true,
  setSidebarOpen: action((state, payload) => {
    state.sidebarOpen = payload;
  }),

  activeNote: null,
  setActiveNote: action((state, payload) => {
    state.activeNote = payload;
  }),

  activeFolderId: 'all',
  setActiveFolderId: action((state, payload) => {
    state.activeFolderId = payload;
  }),
  resetActiveFolder: action((state) => {
    state.activeFolderId = 'all';
  }),
  resetFolderIdIfActive: action((state, folderId) => {
    if (state.activeFolderId === folderId) {
      state.activeFolderId = 'all';
    }
  }),

  editingFolderId: null,
  setEditingFolderId: action((state, payload) => {
    state.editingFolderId = payload;
  }),

  updateUser: thunk(async (actions, payload, { getState }) => {
    const {
      localDB,
      workers,
      user,
      fileCollection,
      passwordKey,
      cloudSyncPasswordKey,
    } = getState();

    if (!localDB || !workers || !user || !fileCollection || !passwordKey) {
      // TODO: show error?
      console.log({ localDB, workers, user, fileCollection, passwordKey });
      return;
    }

    await saveUser(localDB, payload.userItem);

    actions.setUser(payload.userItem);

    if (!payload.noCloudSync && user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorkerized(workers, {
        sessionToken: user.cloudSyncSessionToken,
        user,
        fileCollection,
        fileCollectionNonce: user.fileCollectionNonce,
        passwordKey,
        cloudSyncPasswordKey,
      });
    }
  }),

  updateFileCollection: thunk(async (actions, payload, { getState }) => {
    const { localDB, user, passwordKey } = getState();

    if (!localDB || !user || !passwordKey) {
      // TODO: show error?
      console.log({ localDB, user, passwordKey });
      return;
    }

    await saveFileCollection(localDB, user, passwordKey, payload);
    actions.setFileCollection(payload);
  }),

  updateSettings: thunk(async (actions, payload, { getState }) => {
    log([`Updating settings...`, payload]);

    actions.setSettings(payload);

    const { localDB, user, passwordKey, settings } = getState();

    if (!localDB || !user || !passwordKey) {
      // TODO: show error?
      console.log({ localDB, user, passwordKey });
      return;
    }

    await saveUserSettings(localDB, user, passwordKey, settings || {});
  }),

  updateAppSettings: thunk(async (actions, payload, { getState }) => {
    log([`Updating app settings...`, payload]);

    actions.setAppSettings(payload);

    const { localDB, appSettings } = getState();

    if (!localDB || !appSettings) {
      // TODO: show error?
      console.log({ localDB, appSettings });
      return;
    }

    await saveAppSettings(localDB, appSettings);
  }),

  createNewNote: thunk(async (actions, payload, { getState }) => {
    log([`Creating new note...`, payload]);

    const {
      localDB,
      workers,
      user,
      fileCollection,
      passwordKey,
      cloudSyncPasswordKey,
    } = getState();

    if (!localDB || !workers || !user || !fileCollection || !passwordKey) {
      // TODO: show error?
      console.log({ localDB, workers, user, fileCollection, passwordKey });
      return;
    }

    const id = nanoid(32);
    const created = moment().unix();

    const noteItem: NoteItem = {
      id,
      nonce: bufferToBase64(generateNonce()),
      title: payload.title,
      created: created,
      updated: created,
    };

    if (payload.parentId && !['all', 'trash', 'starred'].includes(payload.parentId)) {
      noteItem.parentId = payload.parentId;
    }

    const noteData: NoteData = {
      id,
      revisions: [],
    };

    const result = await saveNoteData(localDB, passwordKey, noteItem.nonce, noteData);

    if (result.error) {
      // TODO: show error?
      console.log(result.error);
      return;
    }

    const notes = fileCollection.notes;
    notes.push(noteItem);

    const encryptedData = await encrypt(
      passwordKey,
      base64ToBuffer(user.fileCollectionNonce),
      stringToBuffer(JSON.stringify(fileCollection)),
    );

    await localDB.set(`${FILE_COLLECTION_KEY}--${user.id}`, encryptedData);

    actions.setFileCollection(fileCollection);
    actions.setActiveNote({ noteItem, noteData });

    if (user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorkerized(workers, {
        sessionToken: user.cloudSyncSessionToken,
        user,
        fileCollection,
        fileCollectionNonce: user.fileCollectionNonce,
        passwordKey,
        cloudSyncPasswordKey,
      });
    }
  }),

  createNewFolder: thunk(async (actions, payload, { getState }) => {
    log([`Creating new folder...`, payload]);

    const {
      localDB,
      workers,
      user,
      fileCollection,
      passwordKey,
      cloudSyncPasswordKey,
    } = getState();

    if (!localDB || !workers || !user || !fileCollection || !passwordKey) {
      // TODO: show error?
      console.log({ localDB, user, fileCollection, passwordKey });
      return;
    }

    const id = nanoid();
    const created = moment().unix();

    const folder: FolderItem = {
      id,
      title: payload.title,
      created: created,
      updated: created,
    };

    fileCollection.folders.push(folder);

    const result = await saveFileCollection(localDB, user, passwordKey, fileCollection);

    if (result.error) {
      // TODO: show error?
      console.log(result);
      return;
    }

    actions.setFileCollection(fileCollection);
    actions.setActiveFolderId(folder.id);

    if (payload.editOnCreate) {
      actions.setEditingFolderId(folder.id);
    }

    if (user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorkerized(workers, {
        sessionToken: user.cloudSyncSessionToken,
        user,
        fileCollection,
        fileCollectionNonce: user.fileCollectionNonce,
        passwordKey,
        cloudSyncPasswordKey,
      });
    }
  }),

  loadNote: thunk(async (actions, noteItem: NoteItem, { getState }) => {
    const db = getState().localDB;
    const passwordKey = getState().passwordKey;

    if (!db || !passwordKey) {
      // TODO: show error?
      console.log('db is null');
      return;
    }

    const result = await loadNoteData(db, noteItem.id, noteItem.nonce, passwordKey);
    const noteData = result.noteData;

    if (result.error || !noteData) {
      // TODO: show error?
      console.log(result);
      return;
    }

    actions.setActiveNote({ noteItem, noteData });
  }),

  updateNoteItem: thunk(async (actions, payload, { getState }) => {
    log([`Updating note item ${payload.id}...`, payload.noteItem]);

    const {
      localDB,
      workers,
      user,
      fileCollection,
      activeNote,
      passwordKey,
      cloudSyncPasswordKey,
    } = getState();

    if (!fileCollection) {
      // TODO: show error?
      console.log('no file collection');
      return;
    }

    const noteIndex = fileCollection.notes.findIndex((n) => n.id === payload.id);

    if (noteIndex < 0) {
      // TODO: show error?
      console.log(`note does not exist, note ID: ${payload.id}`);
      return;
    }

    fileCollection.notes[noteIndex] = payload.noteItem;

    if (!localDB || !workers || !user || !passwordKey || !fileCollection) {
      // TODO: show error?
      console.log({ localDB, workers, user, passwordKey, fileCollection });
      return;
    }

    const result = await saveFileCollection(localDB, user, passwordKey, fileCollection);

    if (result.error) {
      // TODO: show error?
      console.log(result);
      return;
    }

    actions.setFileCollection({ ...fileCollection });

    if (activeNote?.noteItem.id === payload.id) {
      actions.setActiveNote({ noteItem: payload.noteItem, noteData: activeNote.noteData });
    }

    if (user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorkerized(workers, {
        sessionToken: user.cloudSyncSessionToken,
        user,
        fileCollection,
        fileCollectionNonce: user.fileCollectionNonce,
        passwordKey,
        cloudSyncPasswordKey,
      });
    }
  }),

  updateNoteData: thunk(async (actions, payload, { getState }) => {
    log([`Updating note data ${payload.id}...`, payload.noteData]);

    const {
      localDB,
      workers,
      user,
      fileCollection,
      activeNote,
      passwordKey,
      cloudSyncPasswordKey,
    } = getState();

    if (!fileCollection) {
      // TODO: show error?
      console.log('no file collection');
      return;
    }

    const noteItem = fileCollection.notes.find((n) => n.id === payload.id);

    if (!noteItem) {
      // TODO: show error?
      console.log(`note does not exist, note ID: ${payload.id}`);
      return;
    }

    if (!localDB || !workers || !user || !fileCollection || !passwordKey) {
      // TODO: show error?
      console.log({ localDB, workers, user, fileCollection, passwordKey });
      return;
    }

    const result = await saveNoteData(localDB, passwordKey, noteItem.nonce, payload.noteData);

    if (result.error) {
      // TODO: show error?
      console.log(result);
      return;
    }

    if (activeNote?.noteItem.id === payload.id) {
      actions.setActiveNote({ noteItem: activeNote.noteItem, noteData: payload.noteData });
    }

    if (user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorkerized(workers, {
        sessionToken: user.cloudSyncSessionToken,
        user,
        fileCollection,
        fileCollectionNonce: user.fileCollectionNonce,
        passwordKey,
        cloudSyncPasswordKey,
      });
    }
  }),

  updateFolder: thunk(async (actions, payload, { getState }) => {
    log([`Updating folder ${payload.id}...`, payload.folder]);

    const {
      localDB,
      workers,
      user,
      fileCollection,
      passwordKey,
      cloudSyncPasswordKey,
    } = getState();

    if (!fileCollection) {
      // TODO: show error?
      console.log('no file collection');
      return;
    }

    const folderIndex = fileCollection.folders.findIndex((n) => n.id === payload.id);

    if (folderIndex < 0) {
      // TODO: show error?
      console.log(`folder does not exist, folder ID: ${payload.id}`);
      return;
    }

    fileCollection.folders[folderIndex] = payload.folder;

    if (!localDB || !workers || !user || !passwordKey) {
      // TODO: show error?
      console.log({ localDB, workers, user, passwordKey });
      return;
    }

    const result = await saveFileCollection(localDB, user, passwordKey, fileCollection);

    if (result.error) {
      // TODO: show error?
      console.log(result);
      return;
    }

    actions.setFileCollection({ ...fileCollection });

    if (user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorkerized(workers, {
        sessionToken: user.cloudSyncSessionToken,
        user,
        fileCollection,
        fileCollectionNonce: user.fileCollectionNonce,
        passwordKey,
        cloudSyncPasswordKey,
      });
    }
  }),

  trashNote: thunk(async (actions, noteId, { getState }) => {
    const {
      localDB,
      workers,
      user,
      fileCollection,
      activeNote,
      passwordKey,
      cloudSyncPasswordKey,
    } = getState();

    if (!localDB || !workers || !user || !fileCollection || !passwordKey) {
      // show error?
      console.log({ localDB, workers, user, fileCollection, passwordKey });
      return;
    }

    const noteItem = fileCollection.notes.find((n) => n.id === noteId);

    if (!noteItem) {
      // show error?
      console.log(`note not found, note ID: ${noteId}`);
      return;
    }

    // deactivate if active
    if (activeNote?.noteItem.id === noteId) {
      actions.setActiveNote(null);
    }

    // change isDeleted to true
    noteItem.isDeleted = true;
    await actions.updateNoteItem({ id: noteId, noteItem });

    if (user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorkerized(workers, {
        sessionToken: user.cloudSyncSessionToken,
        user,
        fileCollection,
        fileCollectionNonce: user.fileCollectionNonce,
        passwordKey,
        cloudSyncPasswordKey,
      });
    }
  }),

  trashFolder: thunk(async (actions, folderId, { getState }) => {
    const {
      localDB,
      workers,
      user,
      fileCollection,
      activeFolderId,
      passwordKey,
      cloudSyncPasswordKey,
    } = getState();

    if (!localDB || !workers || !user || !fileCollection || !passwordKey) {
      // show error?
      console.log({ localDB, workers, user, fileCollection, passwordKey });
      return;
    }

    const folder = fileCollection.folders.find((n) => n.id === folderId);

    if (!folder) {
      // show error?
      console.log(`folder not found, folder ID: ${folderId}`);
      return;
    }

    // deactivate if active
    if (activeFolderId === folderId) {
      actions.resetActiveFolder();
    }

    // change isDeleted to true
    folder.isDeleted = true;
    await actions.updateFolder({ id: folderId, folder });

    if (user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorkerized(workers, {
        sessionToken: user.cloudSyncSessionToken,
        user,
        fileCollection,
        fileCollectionNonce: user.fileCollectionNonce,
        passwordKey,
        cloudSyncPasswordKey,
      });
    }
  }),

  emptyTrash: thunk(async (actions, _payload, { getState }) => {
    log('Emptying trash...');

    const {
      localDB,
      workers,
      user,
      fileCollection,
      activeNote,
      activeFolderId,
      passwordKey,
      cloudSyncPasswordKey,
    } = getState();

    if (!fileCollection || !workers || !localDB || !user || !passwordKey) {
      // show error?
      console.log({ fileCollection, localDB, workers, user, passwordKey });
      return;
    }

    const noteIdsToDelete = fileCollection.notes.filter((n) => n.isDeleted).map((n) => n.id);
    const folderIdsToDelete = fileCollection.folders.filter((f) => f.isDeleted).map((f) => f.id);

    fileCollection.notes = fileCollection.notes.filter((n) => !n.isDeleted);
    fileCollection.folders = fileCollection.folders.filter((f) => !f.isDeleted);

    const result = await saveFileCollection(localDB, user, passwordKey, fileCollection);

    if (result.error) {
      // TODO: show error?
      console.log(result);
      return;
    }

    // reset active note
    if (activeNote && noteIdsToDelete.includes(activeNote.noteItem.id)) {
      actions.setActiveNote(null);
    }

    if (activeFolderId && folderIdsToDelete.includes(activeFolderId)) {
      actions.resetActiveFolder();
    }

    actions.setFileCollection({ ...fileCollection });

    if (user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorkerized(workers, {
        sessionToken: user.cloudSyncSessionToken,
        user,
        fileCollection,
        fileCollectionNonce: user.fileCollectionNonce,
        passwordKey,
        cloudSyncPasswordKey,
      });
    }
  }),

  permanentlyDeleteNote: thunk(async (actions, noteId, { getState }) => {
    log(`Permanently deleting note ${noteId}...`);

    const {
      localDB,
      workers,
      user,
      fileCollection,
      activeNote,
      passwordKey,
      cloudSyncPasswordKey,
    } = getState();

    if (!fileCollection || !localDB || !workers || !user || !passwordKey) {
      // show error?
      console.log({ fileCollection, localDB, workers, user, passwordKey });
      return;
    }

    const noteIndex = fileCollection.notes.findIndex((n) => n.id === noteId);

    if (noteIndex > -1) {
      fileCollection.notes.splice(noteIndex, 1);
    }

    const result = await saveFileCollection(localDB, user, passwordKey, fileCollection);

    if (result.error) {
      // TODO: show error?
      console.log(result);
      return;
    }

    actions.setFileCollection({ ...fileCollection });

    if (activeNote?.noteItem.id === noteId) {
      actions.setActiveNote(null);
    }

    if (user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorkerized(workers, {
        sessionToken: user.cloudSyncSessionToken,
        user,
        fileCollection,
        fileCollectionNonce: user.fileCollectionNonce,
        passwordKey,
        cloudSyncPasswordKey,
      });
    }
  }),

  permanentlyDeleteFolder: thunk(async (actions, folderId, { getState }) => {
    log(`Permanently deleting folder ${folderId}...`);

    const {
      localDB,
      workers,
      user,
      fileCollection,
      activeFolderId,
      passwordKey,
      cloudSyncPasswordKey,
    } = getState();

    if (!fileCollection || !localDB || !workers || !user || !passwordKey) {
      // show error?
      console.log({ fileCollection, localDB, workers, user, passwordKey });
      return;
    }

    const folderIndex = fileCollection.folders.findIndex((n) => n.id === folderId);

    if (folderIndex > -1) {
      fileCollection.folders.splice(folderIndex, 1);
    }

    const result = await saveFileCollection(localDB, user, passwordKey, fileCollection);

    if (result.error) {
      // TODO: show error?
      console.log(result);
      return;
    }

    actions.setFileCollection({ ...fileCollection });

    if (activeFolderId === folderId) {
      actions.resetActiveFolder();
    }

    if (user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorkerized(workers, {
        sessionToken: user.cloudSyncSessionToken,
        user,
        fileCollection,
        fileCollectionNonce: user.fileCollectionNonce,
        passwordKey,
        cloudSyncPasswordKey,
      });
    }
  }),
};

export default ApplicationStore;
