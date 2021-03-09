export interface AppSettingsOptions {
  enableCloudSyncLogin: boolean;
}

export const defaultAppSettings: AppSettingsOptions = {
  enableCloudSyncLogin: false,
};

export default defaultAppSettings;
