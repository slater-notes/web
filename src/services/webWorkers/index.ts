import syncAccountAndNotesToCloudSync, { Payload } from '../cloudSync/syncAccountAndNotes';

export const worker__syncAccountAndNotesToCloudSync = async (payload: Payload) => {
  return await syncAccountAndNotesToCloudSync(payload);
};
