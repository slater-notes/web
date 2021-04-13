import { AppSettingsOptions } from '../config/defaultAppSettings';
import disk from '../utils/disk';

const saveAppSettings = async (settings: Partial<AppSettingsOptions>) => {
  await disk.set('app-settings', JSON.stringify(settings));
};

export default saveAppSettings;
