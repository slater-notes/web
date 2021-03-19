import { createStore } from 'easy-peasy';
import { bufferToString, base64ToBuffer, decrypt, localDB } from '@slater-notes/core';
import MainStore from '../stores/mainStore';
import createNewUser from '../services/local/createNewUser';
import loadUser from '../services/local/loadUser';
import { SETTINGS_KEY } from '../utils/DBIndexKeys';
import { addPolyfill } from '../utils/testPolyfill';
import { UserSettingsOptions } from '../stores/mainStore/defaultUserSettings';

addPolyfill();

describe('settings test', () => {
  const store = createStore(MainStore);
  const actions = store.getActions();
  actions.setLocalDB(new localDB(true));
  const db = store.getState().localDB;

  test('new users should have empty settings', async () => {
    const newUserResult = await createNewUser(db as any, {
      username: 'testuser',
      password: 'testpass',
    });
    actions.setPasswordKey(newUserResult.passwordKey || null);
    actions.setUser(newUserResult.user || null);
    actions.setFileCollection(newUserResult.fileCollection || null);
    const state = store.getState();

    expect(state.user?.settingsNonce).toBeTruthy();
    expect(state.settings).toBe(null);

    const encryptedData = await db?.get(`${SETTINGS_KEY}--${state.user?.id}`);

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

    expect(result.settings?.alwaysShowSidebar).toBeTruthy();
  });
});
