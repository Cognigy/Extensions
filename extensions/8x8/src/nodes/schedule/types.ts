import type { INodeFunctionBaseParams } from '@cognigy/extension-tools';
import type StoreLocationName from '../../constants/StoreLocationName';
import type { I8x8SimpleConnection } from '../../connections/8x8SimpleConnection';

export interface IGetScheduleParams extends INodeFunctionBaseParams {
  config: {
    connection: I8x8SimpleConnection
    scheduleNameToID: string
    storeLocation: StoreLocationName
    contextKey?: string
    inputKey?: string
  }
}
