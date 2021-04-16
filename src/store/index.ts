import { action, Action, thunk, Thunk } from 'easy-peasy';
import moment from 'moment';
import { nanoid } from 'nanoid';
import {
  UserItem,
  generateNonce,
  encrypt,
  stringToBuffer,
  bufferToBase64,
  base64ToBuffer,
} from '@slater-notes/core';
import getDecryptedNoteDataFromDisk from '../services/getDecryptedNoteDataFromDisk';
import saveFileCollectionToDisk from '../services/saveFileCollectionToDisk';
import saveNoteDataToDisk from '../services/saveNoteDataToDisk';
import saveUserSettingsToDisk from '../services/saveUserSettingsToDisk';
import { FILE_COLLECTION_KEY } from '../utils/DBIndexKeys';
import { log } from '../utils/log';
import { UserSettingsOptions } from '../config/defaultUserSettings';
import saveUserItemToDisk from '../services/saveUserItemToDisk';
import { syncAccountAndNotesToCloudSyncDebouncedWorker } from '../services/syncAccountAndNotesToCloudSync';
import { AppSettingsOptions } from '../config/defaultAppSettings';
import saveAppSettingsToDisk from '../services/saveAppSettingsToDisk';
import { FileCollection, FolderItem, NoteData, NoteItem } from '../types/notes';
import disk from '../utils/disk';

export interface StoreModel {
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

  /* Thunks */
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
    const { user, fileCollection, passwordKey, cloudSyncPasswordKey } = getState();

    if (!user || !fileCollection || !passwordKey) {
      // TODO: show error?
      console.log({ user, fileCollection, passwordKey });
      return;
    }

    await saveUserItemToDisk(payload.userItem);

    actions.setUser(payload.userItem);

    if (!payload.noCloudSync && user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorker({
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
    const { user, passwordKey } = getState();

    if (!user || !passwordKey) {
      // TODO: show error?
      console.log({ user, passwordKey });
      return;
    }

    await saveFileCollectionToDisk(user, passwordKey, payload);
    actions.setFileCollection({ ...payload });
  }),

  updateSettings: thunk(async (actions, payload, { getState }) => {
    log([`Updating settings...`, payload]);

    actions.setSettings(payload);

    const { user, passwordKey, settings } = getState();

    if (!user || !passwordKey) {
      // TODO: show error?
      console.log({ user, passwordKey });
      return;
    }

    await saveUserSettingsToDisk(user, passwordKey, settings || {});
  }),

  updateAppSettings: thunk(async (actions, payload, { getState }) => {
    log([`Updating app settings...`, payload]);

    actions.setAppSettings(payload);

    const { appSettings } = getState();

    if (!appSettings) {
      // TODO: show error?
      console.log({ appSettings });
      return;
    }

    await saveAppSettingsToDisk(appSettings);
  }),

  createNewNote: thunk(async (actions, payload, { getState }) => {
    log([`Creating new note...`, payload]);

    const { user, fileCollection, passwordKey, cloudSyncPasswordKey } = getState();

    if (!user || !fileCollection || !passwordKey) {
      // TODO: show error?
      console.log({ user, fileCollection, passwordKey });
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

    await saveNoteDataToDisk(passwordKey, noteItem.nonce, noteData);

    const notes = fileCollection.notes;
    notes.push(noteItem);

    const encryptedData = await encrypt(
      passwordKey,
      base64ToBuffer(user.fileCollectionNonce),
      stringToBuffer(JSON.stringify(fileCollection)),
    );

    await disk.set(`${FILE_COLLECTION_KEY}--${user.id}`, encryptedData);

    actions.setFileCollection(fileCollection);
    actions.setActiveNote({ noteItem, noteData });

    if (user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorker({
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

    const { user, fileCollection, passwordKey, cloudSyncPasswordKey } = getState();

    if (!user || !fileCollection || !passwordKey) {
      // TODO: show error?
      console.log({ user, fileCollection, passwordKey });
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

    await saveFileCollectionToDisk(user, passwordKey, fileCollection);

    actions.setFileCollection(fileCollection);
    actions.setActiveFolderId(folder.id);

    if (payload.editOnCreate) {
      actions.setEditingFolderId(folder.id);
    }

    if (user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorker({
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
    const passwordKey = getState().passwordKey;

    if (!passwordKey) {
      // TODO: show error?
      console.log('db is null');
      return;
    }

    const result = await getDecryptedNoteDataFromDisk(noteItem.id, noteItem.nonce, passwordKey);

    if ('error' in result) {
      // TODO: show error?
      console.log(result);
      return;
    }

    actions.setActiveNote({ noteItem, noteData: result.noteData });
  }),

  updateNoteItem: thunk(async (actions, payload, { getState }) => {
    log([`Updating note item ${payload.id}...`, payload.noteItem]);

    const { user, fileCollection, activeNote, passwordKey, cloudSyncPasswordKey } = getState();

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

    if (!user || !passwordKey || !fileCollection) {
      // TODO: show error?
      console.log({ user, passwordKey, fileCollection });
      return;
    }

    await saveFileCollectionToDisk(user, passwordKey, fileCollection);

    actions.setFileCollection({ ...fileCollection });

    if (activeNote?.noteItem.id === payload.id) {
      actions.setActiveNote({ noteItem: payload.noteItem, noteData: activeNote.noteData });
    }

    if (user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorker({
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

    const { user, fileCollection, activeNote, passwordKey, cloudSyncPasswordKey } = getState();

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

    if (!user || !fileCollection || !passwordKey) {
      // TODO: show error?
      console.log({ user, fileCollection, passwordKey });
      return;
    }

    await saveNoteDataToDisk(passwordKey, noteItem.nonce, payload.noteData);

    if (activeNote?.noteItem.id === payload.id) {
      actions.setActiveNote({ noteItem: activeNote.noteItem, noteData: payload.noteData });
    }

    if (user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorker({
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

    const { user, fileCollection, passwordKey, cloudSyncPasswordKey } = getState();

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

    if (!user || !passwordKey) {
      // TODO: show error?
      console.log({ user, passwordKey });
      return;
    }

    await saveFileCollectionToDisk(user, passwordKey, fileCollection);

    actions.setFileCollection({ ...fileCollection });

    if (user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorker({
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
    const { user, fileCollection, activeNote, passwordKey, cloudSyncPasswordKey } = getState();

    if (!user || !fileCollection || !passwordKey) {
      // show error?
      console.log({ user, fileCollection, passwordKey });
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
      syncAccountAndNotesToCloudSyncDebouncedWorker({
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
    const { user, fileCollection, activeFolderId, passwordKey, cloudSyncPasswordKey } = getState();

    if (!user || !fileCollection || !passwordKey) {
      // show error?
      console.log({ user, fileCollection, passwordKey });
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
      syncAccountAndNotesToCloudSyncDebouncedWorker({
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
      user,
      fileCollection,
      activeNote,
      activeFolderId,
      passwordKey,
      cloudSyncPasswordKey,
    } = getState();

    if (!fileCollection || !user || !passwordKey) {
      // show error?
      console.log({ fileCollection, user, passwordKey });
      return;
    }

    const noteIdsToDelete = fileCollection.notes.filter((n) => n.isDeleted).map((n) => n.id);
    const folderIdsToDelete = fileCollection.folders.filter((f) => f.isDeleted).map((f) => f.id);

    fileCollection.notes = fileCollection.notes.filter((n) => !n.isDeleted);
    fileCollection.folders = fileCollection.folders.filter((f) => !f.isDeleted);

    await saveFileCollectionToDisk(user, passwordKey, fileCollection);

    // reset active note
    if (activeNote && noteIdsToDelete.includes(activeNote.noteItem.id)) {
      actions.setActiveNote(null);
    }

    if (activeFolderId && folderIdsToDelete.includes(activeFolderId)) {
      actions.resetActiveFolder();
    }

    actions.setFileCollection({ ...fileCollection });

    if (user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorker({
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

    const { user, fileCollection, activeNote, passwordKey, cloudSyncPasswordKey } = getState();

    if (!fileCollection || !user || !passwordKey) {
      // show error?
      console.log({ fileCollection, user, passwordKey });
      return;
    }

    const noteIndex = fileCollection.notes.findIndex((n) => n.id === noteId);

    if (noteIndex > -1) {
      fileCollection.notes.splice(noteIndex, 1);
    }

    await saveFileCollectionToDisk(user, passwordKey, fileCollection);

    actions.setFileCollection({ ...fileCollection });

    if (activeNote?.noteItem.id === noteId) {
      actions.setActiveNote(null);
    }

    if (user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorker({
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

    const { user, fileCollection, activeFolderId, passwordKey, cloudSyncPasswordKey } = getState();

    if (!fileCollection || !user || !passwordKey) {
      // show error?
      console.log({ fileCollection, user, passwordKey });
      return;
    }

    const folderIndex = fileCollection.folders.findIndex((n) => n.id === folderId);

    if (folderIndex > -1) {
      fileCollection.folders.splice(folderIndex, 1);
    }

    await saveFileCollectionToDisk(user, passwordKey, fileCollection);

    actions.setFileCollection({ ...fileCollection });

    if (activeFolderId === folderId) {
      actions.resetActiveFolder();
    }

    if (user.cloudSyncSessionToken && cloudSyncPasswordKey) {
      syncAccountAndNotesToCloudSyncDebouncedWorker({
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
