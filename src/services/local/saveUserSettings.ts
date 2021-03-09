import { base64ToBuffer, encrypt, localDB, stringToBuffer, UserItem } from '@slater-notes/core';
import { UserSettingsOptions } from '../../stores/mainStore/defaultUserSettings';
import { SETTINGS_KEY } from '../../utils/DBIndexKeys';
import { ServiceResponse } from './services';

interface Response extends ServiceResponse {
  success?: boolean;
}

const saveUserSettings = async (
  db: localDB,
  user: UserItem,
  passwordKey: CryptoKey,
  settings: Partial<UserSettingsOptions>,
): Promise<Response> => {
  // Encrypt
  const json = JSON.stringify(settings);
  const encryptedData = await encrypt(
    passwordKey,
    base64ToBuffer(user.settingsNonce),
    stringToBuffer(json),
  );

  // Save
  await db.set(`${SETTINGS_KEY}--${user.id}`, encryptedData);

  return { success: true };
};

export default saveUserSettings;
