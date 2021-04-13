import { base64ToBuffer, encrypt, localDB, stringToBuffer, UserItem } from '@slater-notes/core';
import { UserSettingsOptions } from '../config/defaultUserSettings';
import { SETTINGS_KEY } from '../utils/DBIndexKeys';

const saveUserSettings = async (
  db: localDB,
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
  await db.set(`${SETTINGS_KEY}--${user.id}`, encryptedData);
};

export default saveUserSettings;
