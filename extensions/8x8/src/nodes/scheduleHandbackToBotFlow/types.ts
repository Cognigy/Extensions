import type { INodeFunctionBaseParams, IResolverParams } from '@cognigy/extension-tools';
import type { I8x8SimpleConnection } from '../../connections/8x8SimpleConnection';
import type StoreLocationName from '../../constants/StoreLocationName';

export interface Webhook {
  id: string
  name: string
  uri: string
  version: string
}

export interface WebhooksResponseList {
  webhooks: Webhook[]
}

export interface WebhooksResponseBody {
  _embedded: WebhooksResponseList
  page?: {
    number: number
    size: number
    totalElements: number
    totalPages: number
  }
}

export interface ScheduleHandbackToBotFlowConfiguration {
  notifyChannelWebhookIfExists?: string
  maxTotalMinutes?: string
  userTimeoutInMinutes?: string
}

export type IGetWebhooksDropdownOptionsParams = IResolverParams & {
  config: {
    connection: I8x8SimpleConnection
  }
};

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
