import { localDB } from '@slater-notes/core';
import defaultAppSettings, { AppSettingsOptions } from '../config/defaultAppSettings';

const loadAppSettings = async (db: localDB): Promise<Partial<AppSettingsOptions>> => {
  const appSettings = (await db.get('app-settings')) as string | undefined;
  return appSettings ? JSON.parse(appSettings) : defaultAppSettings;
};

export default loadAppSettings;
