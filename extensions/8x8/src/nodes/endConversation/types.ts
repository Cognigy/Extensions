import type { INodeFunctionBaseParams } from '@cognigy/extension-tools';
import type { I8x8SimpleConnection } from '../../connections/8x8SimpleConnection';
import type StoreLocationName from '../../constants/StoreLocationName';

export interface EndConversationConfiguration {
  removed?: boolean
  displayMessage?: string
}

export interface IEndConversationParams extends INodeFunctionBaseParams {
  config: {
    connection: I8x8SimpleConnection
    participantChatGatewayPatchRequest?: EndConversationConfiguration
    storeLocation: StoreLocationName
    inputKey?: string
    contextKey?: string
  }
}
