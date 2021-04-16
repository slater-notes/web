import { createStore } from 'easy-peasy';
import ApplicationStore from '../store';
import createUserOnDisk from '../services/createUserOnDisk';
import getDecryptedAccountFromDisk from '../services/getDecryptedAccountFromDisk';
import { addPolyfill } from '../utils/testPolyfill';

addPolyfill();

describe('user test', () => {
  const store = createStore(ApplicationStore);
  const actions = store.getActions();

  test('create a user', async () => {
    const result = await createUserOnDisk({
      username: 'testuser',
      password: 'testpass',
      iterations: 10000,
    });

    if ('success' in result) {
      actions.setPasswordKey(result.passwordKey);
      actions.setUser(result.user);
      actions.setFileCollection(result.fileCollection);
    }

    const { user, passwordKey } = store.getState();

    expect(user?.username).toEqual('testuser');
    expect(user?.iterations).toEqual(10000);
    expect(passwordKey).toBeTruthy();
  });

  test('loading user that does not exist should fail gracefully', async () => {
    const result = await getDecryptedAccountFromDisk({ username: 'nouser', password: 'nopass' });

    if (!('error' in result)) fail();

    expect(result.error).toBeTruthy();
    expect(result.errorCode).toEqual('no_user');
    expect(result.error).toEqual('No user with that username.');
  });

  test('loading user with wrong password should fail gracefully', async () => {
    const result = await getDecryptedAccountFromDisk({
      username: 'testuser',
      password: 'PassThatDoesNotMatch',
    });

    if (!('error' in result)) fail();

    expect(result.error).toEqual('Bad decryption key.');
  });

  test('load user data successfully', async () => {
    const result = await getDecryptedAccountFromDisk({
      username: 'testuser',
      password: 'testpass',
    });

    if ('error' in result) fail();

    expect(result.user?.username).toEqual('testuser');
    expect(result.passwordKey).toBeTruthy();
    expect(result.fileCollection?.userId).toEqual(result.user?.id);
  });

  test('load an empty file collection', async () => {
    const { fileCollection } = store.getState();

    expect(fileCollection).toBeTruthy();
    expect(fileCollection?.userId).toBeTruthy();
    expect(fileCollection?.folders).toHaveLength(0);
    expect(fileCollection?.notes).toHaveLength(0);
  });
});
