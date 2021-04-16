import { AppSettingsOptions } from '../config/defaultAppSettings';
import disk from '../utils/disk';

const saveAppSettingsToDisk = async (settings: Partial<AppSettingsOptions>) => {
  await disk.set('app-settings', JSON.stringify(settings));
};

export default saveAppSettingsToDisk;
