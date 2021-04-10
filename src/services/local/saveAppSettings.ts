import { localDB } from '@slater-notes/core';
import { AppSettingsOptions } from '../../config/defaultAppSettings';
import { ServiceResponse } from './services';

interface Response extends ServiceResponse {
  success?: boolean;
}

const saveAppSettings = async (
  db: localDB,
  settings: Partial<AppSettingsOptions>,
): Promise<Response> => {
  await db.set('app-settings', JSON.stringify(settings));
  return { success: true };
};

export default saveAppSettings;
