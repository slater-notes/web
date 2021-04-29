import { createStore } from 'easy-peasy';
import moment from 'moment';
import { bufferToString, base64ToBuffer, decrypt } from '@slater-notes/core';
import ApplicationStore from '../store';
import createUserOnDisk from '../services/createUserOnDisk';
import { FILE_COLLECTION_KEY } from '../utils/DBIndexKeys';
import { addPolyfill } from '../utils/testPolyfill';
import { FileCollection, NoteData } from '../types/notes';
import disk from '../utils/disk';

addPolyfill();

describe('notes test', () => {
  const store = createStore(ApplicationStore);

  test('file collection is loaded on user load', async () => {
    const result = await createUserOnDisk({
      username: 'testuser',
      password: 'testpass',
    });

    if ('success' in result) {
      const { setPasswordKey, setUser, setFileCollection } = store.getActions();
      setPasswordKey(result.passwordKey);
      setUser(result.user);
      setFileCollection(result.fileCollection);
    }

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

    const encryptedData = await disk.get(`${FILE_COLLECTION_KEY}--${state.user?.id}`);

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

    const encryptedData = await disk.get(state.activeNote?.noteItem.id as string);

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

    if (!noteItem) throw Error('noteItem is undefined');

    await actions.loadNote(noteItem);

    const { activeNote } = store.getState();

    expect(activeNote?.noteItem).toEqual(noteItem);
    expect(activeNote?.noteData?.id).toEqual(noteItem.id);
    expect(activeNote?.noteData?.revisions).toHaveLength(0);
  });

  test('change note title', async () => {
    let state = store.getState();
    const noteItem = state.fileCollection?.notes[0];

    if (!noteItem || !noteItem.id) throw Error('no notes');

    noteItem.title = 'Changed Title';
    noteItem.updated = moment().unix() + 1;
    await store.getActions().updateNoteItem({ id: noteItem.id, noteItem });

    state = store.getState();

    expect(state.fileCollection?.notes[0].title).toEqual('Changed Title');
    expect(state.fileCollection?.notes[0].updated).toBeGreaterThan(
      state.fileCollection?.notes[0].created as number,
    );

    const encryptedData = await disk.get(`${FILE_COLLECTION_KEY}--${state.user?.id}`);
    const decryptedData = await decrypt(
      state.passwordKey as any,
      base64ToBuffer(state.user?.fileCollectionNonce as any),
      encryptedData as any,
    );

    const fileCollection: FileCollection = JSON.parse(bufferToString(decryptedData));

    expect(fileCollection.notes[0].title).toEqual('Changed Title');
  });

  test.todo('add note data');

  test('create new folder', async () => {
    await store.getActions().createNewFolder({ title: 'Test Folder' });

    const state = store.getState();
    expect(state.activeFolderId).toBeTruthy();
    expect(state.fileCollection?.folders).toHaveLength(1);
    expect(state.fileCollection?.folders[0].title).toEqual('Test Folder');

    const encryptedData = await disk.get(`${FILE_COLLECTION_KEY}--${state.user?.id}`);
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

    if (!noteItem || !folderId) throw Error('no active note or folder');

    noteItem.parentId = folderId;

    await store.getActions().updateNoteItem({ id: noteItem.id, noteItem });

    state = store.getState();
    expect(state.activeNote?.noteItem.parentId).toEqual(folderId);

    const encryptedData = await disk.get(`${FILE_COLLECTION_KEY}--${state.user?.id}`);
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

    if (!noteItem) throw Error('no active note');

    await store.getActions().trashNote(noteItem.id);

    state = store.getState();
    expect(state.fileCollection?.notes[0].isDeleted).toBe(true);

    const encryptedData = await disk.get(`${FILE_COLLECTION_KEY}--${state.user?.id}`);
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

    if (!folderId) throw Error('no folder in file collection');

    await store.getActions().trashFolder(folderId);

    state = store.getState();
    expect(state.fileCollection?.folders[0].isDeleted).toBe(true);

    const encryptedData = await disk.get(`${FILE_COLLECTION_KEY}--${state.user?.id}`);
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

    if (!noteId) throw Error('note not found');

    await store.getActions().permanentlyDeleteNote(noteId);

    const state = store.getState();
    expect(state.fileCollection?.notes).toHaveLength(0);

    const encryptedData = await disk.get(`${FILE_COLLECTION_KEY}--${state.user?.id}`);
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

    if (!folderId) throw Error('folder not found');

    await store.getActions().permanentlyDeleteFolder(folderId);

    const state = store.getState();
    expect(state.fileCollection?.folders).toHaveLength(0);

    const encryptedData = await disk.get(`${FILE_COLLECTION_KEY}--${state.user?.id}`);
    const decryptedData = await decrypt(
      state.passwordKey as any,
      base64ToBuffer(state.user?.fileCollectionNonce as any),
      encryptedData as any,
    );

    const savedFileCollection: FileCollection = JSON.parse(bufferToString(decryptedData));

    expect(savedFileCollection.folders).toHaveLength(0);
  });
});
