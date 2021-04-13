import { localDB } from '@slater-notes/core';
import { AppSettingsOptions } from '../../config/defaultAppSettings';

const saveAppSettings = async (db: localDB, settings: Partial<AppSettingsOptions>) => {
  await db.set('app-settings', JSON.stringify(settings));
};

export default saveAppSettings;
