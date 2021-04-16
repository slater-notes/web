import { base64ToBuffer, encrypt, stringToBuffer, UserItem } from '@slater-notes/core';
import { UserSettingsOptions } from '../config/defaultUserSettings';
import { SETTINGS_KEY } from '../utils/DBIndexKeys';
import disk from '../utils/disk';

const saveUserSettingsToDisk = async (
  user: UserItem,
  passwordKey: CryptoKey,
  settings: Partial<UserSettingsOptions>,
) => {
  // Encrypt
  const json = JSON.stringify(settings);
  const encryptedData = await encrypt(
    passwordKey,
    base64ToBuffer(user.settingsNonce),
    stringToBuffer(json),
  );

  // Save
  await disk.set(`${SETTINGS_KEY}--${user.id}`, encryptedData);
};

export default saveUserSettingsToDisk;
