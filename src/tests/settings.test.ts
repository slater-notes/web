import { createStore } from 'easy-peasy';
// import { bufferToString, base64ToBuffer, decrypt } from '@slater-notes/core';
import ApplicationStore from '../store';
import createUserOnDisk from '../services/createUserOnDisk';
// import getDecryptedAccountFromDisk from '../services/getDecryptedAccountFromDisk';
import { SETTINGS_KEY } from '../utils/DBIndexKeys';
import { addPolyfill } from '../utils/testPolyfill';
// import { UserSettingsOptions } from '../config/defaultUserSettings';
import disk from '../utils/disk';

addPolyfill();

describe('settings test', () => {
  const store = createStore(ApplicationStore);
  const actions = store.getActions();

  test('new users should have empty settings', async () => {
    const newUserResult = await createUserOnDisk({
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

    const encryptedData = await disk.get(`${SETTINGS_KEY}--${user?.id}`);

    expect(encryptedData).toBeFalsy();
  });

  // test('updating a setting should update store and db', async () => {
  //   await actions.updateSettings({ alwaysShowSidebar: true });

  //   const state = store.getState();
  //   expect(state.settings).toEqual({ alwaysShowSidebar: true });

  //   const encryptedData = await disk.get(`${SETTINGS_KEY}--${state.user?.id}`);
  //   const decryptedData = await decrypt(
  //     state.passwordKey as any,
  //     base64ToBuffer(state.user?.settingsNonce as any),
  //     encryptedData as any,
  //   );

  //   const savedSettings: UserSettingsOptions = JSON.parse(bufferToString(decryptedData));

  //   expect(savedSettings).toBeTruthy();
  //   expect(savedSettings.alwaysShowSidebar).toBeTruthy();
  // });

  // test('loading users should load its settings', async () => {
  //   const result = await getDecryptedAccountFromDisk({
  //     username: 'testuser',
  //     password: 'testpass',
  //   });

  //   if ('error' in result) throw 0;
  // });
});
