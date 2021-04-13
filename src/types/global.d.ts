import * as w from '../webWorkers/workerizedServices';

export declare global {
  var webWorkers: Workerized<typeof w>;
}
