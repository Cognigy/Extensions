import type { INodeFunctionBaseParams } from '@cognigy/extension-tools';
import type StoreLocationName from '../../constants/StoreLocationName';
import type { I8x8SimpleConnection } from '../../connections/8x8SimpleConnection';
import type { SearchGenericParams } from '../../types';
import type { DataAugmentationRequestBody } from './api/postDataAugmentation';

export interface DataAugmentationParams extends SearchGenericParams {
  displayName1: string
  value1: string
  displayName2: string
  value2: string
  displayName3: string
  value3: string
  displayName4: string
  value4: string
  displayName5: string
  value5: string
}

export interface IDataAugmentationParams extends INodeFunctionBaseParams {
  config: {
    connection: I8x8SimpleConnection
    sipCallId: string
    useCustomFields: boolean
    customFields: DataAugmentationRequestBody
    storeLocation: StoreLocationName
    contextKey?: string
    inputKey?: string
  } & DataAugmentationParams
}
