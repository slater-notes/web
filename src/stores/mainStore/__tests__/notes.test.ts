import { createStore } from 'easy-peasy';
import moment from 'moment';
import {
  bufferToString,
  base64ToBuffer,
  decrypt,
  FileCollection,
  localDB,
  NoteData,
} from '@slater-notes/core';
import MainStore from '..';
import createNewUser from '../../../services/local/createNewUser';
import { FILE_COLLECTION_KEY } from '../../../utils/DBIndexKeys';
import { addPolyfill } from '../../../utils/testPolyfill';

addPolyfill();

describe('notes test', () => {
  const store = createStore(MainStore);
  store.getActions().setLocalDB(new localDB(true));
  const db = store.getState().localDB;

  test('file collection is loaded on user load', async () => {
    const result = await createNewUser(db as localDB, {
      username: 'testuser',
      password: 'testpass',
    });

    const actions = store.getActions();
    actions.setPasswordKey(result.passwordKey || null);
    actions.setUser(result.user || null);
    actions.setFileCollection(result.fileCollection || null);

    const state = store.getState();
    expect(state.fileCollection?.userId).toBeTruthy();
    expect(state.fileCollection?.notes).toHaveLength(0);
    expect(state.fileCollection?.folders).toHaveLength(0);
  });

  test('create a new note with empty data', async () => {
    await store.getActions().createNewNote({ title: 'Test Note' });

    expect(store.getState().fileCollection?.notes).toHaveLength(1);
    expect(store.getState().activeNote?.noteItem?.title).toEqual('Test Note');
    expect(store.getState().activeNote?.noteData?.revisions).toHaveLength(0);
  });

  test('file collection has been saved locally', async () => {
    const state = store.getState();

    const encryptedData = await db?.get(`${FILE_COLLECTION_KEY}--${state.user?.id}`);

    expect(encryptedData).toBeTruthy();

    const decryptedData = await decrypt(
      state.passwordKey as any,
      base64ToBuffer(state.user?.fileCollectionNonce as any),
      encryptedData as any,
    );

    const fileCollection: FileCollection = JSON.parse(bufferToString(decryptedData));

    expect(fileCollection.userId).toEqual(state.user?.id);
    expect(fileCollection.notes).toHaveLength(1);
    expect(fileCollection.notes[0].title).toEqual('Test Note');
    expect(fileCollection.folders).toHaveLength(0);
  });

  test('new note data has been saved locally', async () => {
    const state = store.getState();

    const encryptedData = await db?.get(state.activeNote?.noteItem.id as string);

    expect(encryptedData).toBeTruthy();

    const decryptedData = await decrypt(
      state.passwordKey as any,
      base64ToBuffer(state.activeNote?.noteItem.nonce as any),
      encryptedData as any,
    );

    const noteData: NoteData = JSON.parse(bufferToString(decryptedData));

    expect(noteData.id).toEqual(state.activeNote?.noteItem.id);
    expect(noteData.revisions).toHaveLength(0);
  });

  test('load an existing note', async () => {
    let state = store.getState();
    const actions = store.getActions();
    const noteItem = state.fileCollection?.notes[0];

    if (!noteItem) {
      fail('noteItem is undefined');
    }

    await actions.loadNote(noteItem);

    state = store.getState();

    expect(state.activeNote?.noteItem).toEqual(noteItem);
    expect(state.activeNote?.noteData?.id).toEqual(noteItem.id);
    expect(state.activeNote?.noteData?.revisions).toHaveLength(0);
  });

  test('change note title', async () => {
    let state = store.getState();
    const noteItem = state.fileCollection?.notes[0];

    if (!noteItem || !noteItem.id) {
      fail('no notes');
    }

    noteItem.title = 'Changed Title';
    noteItem.updated = moment().unix() + 1;
    await store.getActions().updateNoteItem({ id: noteItem.id, noteItem });

    state = store.getState();

    expect(state.fileCollection?.notes[0].title).toEqual('Changed Title');
    expect(state.fileCollection?.notes[0].updated).toBeGreaterThan(
      state.fileCollection?.notes[0].created as number,
    );

    const encryptedData = await db?.get(`${FILE_COLLECTION_KEY}--${state.user?.id}`);
    const decryptedData = await decrypt(
      state.passwordKey as any,
      base64ToBuffer(state.user?.fileCollectionNonce as any),
      encryptedData as any,
    );

    const fileCollection: FileCollection = JSON.parse(bufferToString(decryptedData));

    expect(fileCollection.notes[0].title).toEqual('Changed Title');
  });

  test('add note data', async () => {
    let state = store.getState();

    const noteData = state.activeNote?.noteData;

    if (!noteData) {
      fail('no active note');
    }

    noteData.revisions.unshift({
      time: 1609764867671,
      blocks: [
        {
          type: 'paragraph',
          data: { text: 'Hello World!' },
        },
      ],
      version: '2.19.0',
    });

    await store.getActions().updateNoteData({ id: noteData.id, noteData });

    state = store.getState();
    expect(state.activeNote?.noteData.revisions).toHaveLength(1);
    expect(state.activeNote?.noteData.revisions[0].blocks).toHaveLength(1);
    expect(state.activeNote?.noteData.revisions[0].blocks[0].data.text).toEqual('Hello World!');

    const encryptedData = await db?.get(noteData.id);
    const decryptedData = await decrypt(
      state.passwordKey as any,
      base64ToBuffer(state.activeNote?.noteItem.nonce as any),
      encryptedData as any,
    );

    const savedNoteData: NoteData = JSON.parse(bufferToString(decryptedData));

    expect(savedNoteData.revisions[0].blocks[0].data.text).toEqual('Hello World!');
  });

  test('create new folder', async () => {
    await store.getActions().createNewFolder({ title: 'Test Folder' });

    const state = store.getState();
    expect(state.activeFolderId).toBeTruthy();
    expect(state.fileCollection?.folders).toHaveLength(1);
    expect(state.fileCollection?.folders[0].title).toEqual('Test Folder');

    const encryptedData = await db?.get(`${FILE_COLLECTION_KEY}--${state.user?.id}`);
    const decryptedData = await decrypt(
      state.passwordKey as any,
      base64ToBuffer(state.user?.fileCollectionNonce as any),
      encryptedData as any,
    );

    const savedFileCollection: FileCollection = JSON.parse(bufferToString(decryptedData));

    expect(savedFileCollection.folders[0].title).toEqual('Test Folder');
  });

  test('add note to folder', async () => {
    let state = store.getState();

    const noteItem = state.activeNote?.noteItem;
    const folderId = state.activeFolderId;

    if (!noteItem || !folderId) {
      fail('no active note or folder');
    }

    noteItem.parentId = folderId;

    await store.getActions().updateNoteItem({ id: noteItem.id, noteItem });

    state = store.getState();
    expect(state.activeNote?.noteItem.parentId).toEqual(folderId);

    const encryptedData = await db?.get(`${FILE_COLLECTION_KEY}--${state.user?.id}`);
    const decryptedData = await decrypt(
      state.passwordKey as any,
      base64ToBuffer(state.user?.fileCollectionNonce as any),
      encryptedData as any,
    );

    const savedFileCollection: FileCollection = JSON.parse(bufferToString(decryptedData));

    expect(savedFileCollection.notes[0].parentId).toEqual(folderId);
  });

  test('move note to trash', async () => {
    let state = store.getState();

    const noteItem = state.activeNote?.noteItem;

    if (!noteItem) {
      fail('no active note');
    }

    await store.getActions().trashNote(noteItem.id);

    state = store.getState();
    expect(state.fileCollection?.notes[0].isDeleted).toBe(true);

    const encryptedData = await db?.get(`${FILE_COLLECTION_KEY}--${state.user?.id}`);
    const decryptedData = await decrypt(
      state.passwordKey as any,
      base64ToBuffer(state.user?.fileCollectionNonce as any),
      encryptedData as any,
    );

    const savedFileCollection: FileCollection = JSON.parse(bufferToString(decryptedData));

    expect(savedFileCollection.notes[0].isDeleted).toBe(true);
  });

  test('move folder to trash', async () => {
    let state = store.getState();

    const folderId = state.fileCollection?.folders[0].id;

    if (!folderId) {
      fail('no folder in file collection');
    }

    await store.getActions().trashFolder(folderId);

    state = store.getState();
    expect(state.fileCollection?.folders[0].isDeleted).toBe(true);

    const encryptedData = await db?.get(`${FILE_COLLECTION_KEY}--${state.user?.id}`);
    const decryptedData = await decrypt(
      state.passwordKey as any,
      base64ToBuffer(state.user?.fileCollectionNonce as any),
      encryptedData as any,
    );

    const savedFileCollection: FileCollection = JSON.parse(bufferToString(decryptedData));

    expect(savedFileCollection.folders[0].isDeleted).toBe(true);
  });

  test('permanently delete notes', async () => {
    const noteId = store.getState().fileCollection?.notes[0].id;

    if (!noteId) {
      fail('note not found');
    }

    await store.getActions().permanentlyDeleteNote(noteId);

    const state = store.getState();
    expect(state.fileCollection?.notes).toHaveLength(0);

    const encryptedData = await db?.get(`${FILE_COLLECTION_KEY}--${state.user?.id}`);
    const decryptedData = await decrypt(
      state.passwordKey as any,
      base64ToBuffer(state.user?.fileCollectionNonce as any),
      encryptedData as any,
    );

    const savedFileCollection: FileCollection = JSON.parse(bufferToString(decryptedData));

    expect(savedFileCollection.notes).toHaveLength(0);
  });

  test('permanently delete folders', async () => {
    const folderId = store.getState().fileCollection?.folders[0].id;

    if (!folderId) {
      fail('folder not found');
    }

    await store.getActions().permanentlyDeleteFolder(folderId);

    const state = store.getState();
    expect(state.fileCollection?.folders).toHaveLength(0);

    const encryptedData = await db?.get(`${FILE_COLLECTION_KEY}--${state.user?.id}`);
    const decryptedData = await decrypt(
      state.passwordKey as any,
      base64ToBuffer(state.user?.fileCollectionNonce as any),
      encryptedData as any,
    );

    const savedFileCollection: FileCollection = JSON.parse(bufferToString(decryptedData));

    expect(savedFileCollection.folders).toHaveLength(0);
  });
});
