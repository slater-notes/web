import defaultAppSettings, { AppSettingsOptions } from '../config/defaultAppSettings';
import disk from '../utils/disk';

const getAppSettingsFromDisk = async (): Promise<Partial<AppSettingsOptions>> => {
  const appSettings = (await disk.get('app-settings')) as string | undefined;
  return appSettings ? JSON.parse(appSettings) : defaultAppSettings;
};

export default getAppSettingsFromDisk;
