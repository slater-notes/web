import { createStore } from 'easy-peasy';
import { bufferToString, base64ToBuffer, decrypt, localDB } from '@slater-notes/core';
import ApplicationStore from '../store';
import createNewUser from '../services/createNewUser';
import loadUser from '../services/loadUser';
import { SETTINGS_KEY } from '../utils/DBIndexKeys';
import { addPolyfill } from '../utils/testPolyfill';
import { UserSettingsOptions } from '../config/defaultUserSettings';

addPolyfill();

describe('settings test', () => {
  const store = createStore(ApplicationStore);
  const actions = store.getActions();
  actions.setLocalDB(new localDB(true));
  const db = store.getState().localDB;

  test('new users should have empty settings', async () => {
    const newUserResult = await createNewUser(db as any, {
      username: 'testuser',
      password: 'testpass',
    });

    if ('success' in newUserResult) {
      actions.setPasswordKey(newUserResult.passwordKey || null);
      actions.setUser(newUserResult.user || null);
      actions.setFileCollection(newUserResult.fileCollection || null);
    }

    const { user, settings } = store.getState();

    expect(user?.settingsNonce).toBeTruthy();
    expect(settings).toBe(null);

    const encryptedData = await db?.get(`${SETTINGS_KEY}--${user?.id}`);

    expect(encryptedData).toBeFalsy();
  });

  test('updating a setting should update store and db', async () => {
    await actions.updateSettings({ alwaysShowSidebar: true });

    const state = store.getState();
    expect(state.settings).toEqual({ alwaysShowSidebar: true });

    const encryptedData = await db?.get(`${SETTINGS_KEY}--${state.user?.id}`);
    const decryptedData = await decrypt(
      state.passwordKey as any,
      base64ToBuffer(state.user?.settingsNonce as any),
      encryptedData as any,
    );

    const savedSettings: UserSettingsOptions = JSON.parse(bufferToString(decryptedData));

    expect(savedSettings).toBeTruthy();
    expect(savedSettings.alwaysShowSidebar).toBeTruthy();
  });

  test('loading users should load its settings', async () => {
    const result = await loadUser(db as any, { username: 'testuser', password: 'testpass' });

    if ('error' in result) {
      fail();
    } else {
      expect(result.settings?.alwaysShowSidebar).toBeTruthy();
    }
  });
});
