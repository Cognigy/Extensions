import type { INodeFunctionBaseParams } from '@cognigy/extension-tools';
import type StoreLocationName from '../../constants/StoreLocationName';
import type { I8x8SimpleConnection } from '../../connections/8x8SimpleConnection';
import type { SearchGenericParams } from '../../types';

export interface SearchCustomerParams extends SearchGenericParams {
  filter$customFields?: Record<string, string>
}

export interface IHandoverToVoiceQueueParams extends INodeFunctionBaseParams {
  config: {
    connection: I8x8SimpleConnection
    handoverInitiated: string
    queueId: string
    sipCallId: string
    customFields: JSON
    storeLocation: StoreLocationName
    contextKey?: string
    inputKey?: string
  }
}
