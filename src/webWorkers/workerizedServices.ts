import syncAccountAndNotesToCloudSync, {
  Payload,
} from '../services/syncAccountAndNotesToCloudSync';

export const worker__syncAccountAndNotesToCloudSync = async (payload: Payload) => {
  return await syncAccountAndNotesToCloudSync(payload);
};
