import { createStore } from 'easy-peasy';
import { localDB } from '@slater-notes/core';
import ApplicationStore from '../store';
import createNewUser from '../services/createNewUser';
import loadUser from '../services/loadUser';
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

    if ('success' in result) {
      store.getActions().setPasswordKey(result.passwordKey);
      store.getActions().setUser(result.user);
      store.getActions().setFileCollection(result.fileCollection);
    }

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

    if (!('error' in result)) fail();

    expect(result.error).toBeTruthy();
    expect(result.errorCode).toEqual('no_user');
    expect(result.error).toEqual('No user with that username.');
  });

  test('loading user with wrong password should fail gracefully', async () => {
    if (!db) {
      expect(db).toBeTruthy();
      return;
    }

    const result = await loadUser(db, { username: 'testuser', password: 'PassThatDoesNotMatch' });

    if (!('error' in result)) fail();

    expect(result.error).toEqual('Bad decryption key.');
  });

  test('load user data successfully', async () => {
    if (!db) {
      return;
    }

    const result = await loadUser(db, { username: 'testuser', password: 'testpass' });

    if ('error' in result) fail();

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
