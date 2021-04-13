// eslint-disable-next-line import/no-webpack-loader-syntax
import workerized from 'workerize-loader!./workerizedServices';
import * as w from './workerizedServices';

const webWorkers = workerized<typeof w>();
export default webWorkers;
