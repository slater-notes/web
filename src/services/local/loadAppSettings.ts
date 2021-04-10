import { localDB } from '@slater-notes/core';
import defaultAppSettings, { AppSettingsOptions } from '../../config/defaultAppSettings';
import { ServiceResponse } from './services';

interface Response extends ServiceResponse {
  appSettings: Partial<AppSettingsOptions>;
}

const loadAppSettings = async (db: localDB): Promise<Response> => {
  const appSettings = (await db.get('app-settings')) as string | undefined;
  return { appSettings: appSettings ? JSON.parse(appSettings) : defaultAppSettings };
};

export default loadAppSettings;
