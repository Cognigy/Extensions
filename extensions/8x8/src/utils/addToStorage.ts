import type { INodeExecutionAPI } from '@cognigy/extension-tools/build/interfaces/descriptor';
import StoreLocationName from '../constants/StoreLocationName';

interface AddToStorageParams<T> {
  api: INodeExecutionAPI
  storeLocation: StoreLocationName
  contextKey?: string
  inputKey?: string
  data: T
}

function addToStorage<T>({ api, contextKey, data, inputKey, storeLocation }: AddToStorageParams<T>): void {
  const storeKey = storeLocation === StoreLocationName.Context ? contextKey : inputKey;
  if (!storeKey) return;

  switch (storeLocation) {
    case StoreLocationName.Context:
      api.addToContext?.(storeKey, data, 'simple');
      break;
    case StoreLocationName.Input:
      // @ts-expect-error
      api.addToInput(storeKey, data);
      break;
  }
}

export default addToStorage;
