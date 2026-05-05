import type { INodeFunctionBaseParams } from '@cognigy/extension-tools';
import type { I8x8SimpleConnection } from '../../connections/8x8SimpleConnection';
import type StoreLocationName from '../../constants/StoreLocationName';

export interface ScheduleHandbackToBotFlowConfiguration {
  notifyChannelWebhookIfExists?: string
  maxTotalMinutes?: string
  userTimeoutInMinutes?: string
}

export interface IScheduleHandbackToBotFlowParams extends INodeFunctionBaseParams {
  config: {
    connection: I8x8SimpleConnection
    id: string
    type: string
    configuration?: ScheduleHandbackToBotFlowConfiguration
    storeLocation: StoreLocationName
    inputKey?: string
    contextKey?: string
  }
}
