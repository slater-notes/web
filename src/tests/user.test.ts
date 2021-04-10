import { createStore } from 'easy-peasy';
import { localDB } from '@slater-notes/core';
import ApplicationStore from '../store';
import createNewUser from '../services/local/createNewUser';
import loadUser from '../services/local/loadUser';
import { addPolyfill } from '../utils/testPolyfill';

addPolyfill();

describe('user test', () => {
  const store = createStore(ApplicationStore);
  store.getActions().setLocalDB(new localDB(true));
  const db = store.getState().localDB;

  test('initialize localDB', async () => {
    expect(db).toBeTruthy();
  });

  test('create a user', async () => {
    if (!db) {
      return;
    }

    const result = await createNewUser(db, {
      username: 'testuser',
      password: 'testpass',
      iterations: 10000,
    });

    expect(result.error).toBeUndefined();
    expect(result.user).toBeTruthy();
    expect(result.passwordKey).toBeTruthy();

    store.getActions().setPasswordKey(result.passwordKey || null);
    store.getActions().setUser(result.user || null);
    store.getActions().setFileCollection(result.fileCollection || null);

    expect(store.getState().user?.username).toEqual('testuser');
    expect(store.getState().user?.iterations).toEqual(10000);
    expect(store.getState().passwordKey).toBeTruthy();
  });

  test('loading user that does not exist should fail gracefully', async () => {
    const store = createStore(ApplicationStore);
    store.getActions().setLocalDB(new localDB(true));
    const db = store.getState().localDB;

    if (!db) {
      expect(db).toBeTruthy();
      return;
    }

    const result = await loadUser(db, { username: 'nouser', password: 'nopass' });

    expect(result.error).toBeTruthy();
    expect(result.error?.code).toEqual('no_user');
    expect(result.error?.message).toEqual('No user with that username.');
    expect(result.user).toBeUndefined();
    expect(result.passwordKey).toBeUndefined();
    expect(result.fileCollection).toBeUndefined();
  });

  test('loading user with wrong password should fail gracefully', async () => {
    if (!db) {
      expect(db).toBeTruthy();
      return;
    }

    const result = await loadUser(db, { username: 'testuser', password: 'PassThatDoesNotMatch' });

    expect(result.error).toBeTruthy();
    expect(result.error?.message).toEqual('Bad decryption key.');
    expect(result.user).toBeUndefined();
    expect(result.passwordKey).toBeUndefined();
    expect(result.fileCollection).toBeUndefined();
  });

  test('load user data successfully', async () => {
    if (!db) {
      return;
    }

    const result = await loadUser(db, { username: 'testuser', password: 'testpass' });

    expect(result.error).toBeUndefined();
    expect(result.user?.username).toEqual('testuser');
    expect(result.passwordKey).toBeTruthy();
    expect(result.fileCollection?.userId).toEqual(result.user?.id);
  });

  test('load an empty file collection', async () => {
    expect(store.getState().fileCollection).toBeTruthy();
    expect(store.getState().fileCollection?.userId).toBeTruthy();
    expect(store.getState().fileCollection?.folders).toHaveLength(0);
    expect(store.getState().fileCollection?.notes).toHaveLength(0);
  });
});
