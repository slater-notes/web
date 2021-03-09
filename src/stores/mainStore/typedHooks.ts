import { createTypedHooks } from 'easy-peasy';
import { MainStoreModel } from '.';

const { useStoreActions, useStoreState, useStoreDispatch, useStore } = createTypedHooks<
  MainStoreModel
>();

export { useStoreActions, useStoreState, useStoreDispatch, useStore };
