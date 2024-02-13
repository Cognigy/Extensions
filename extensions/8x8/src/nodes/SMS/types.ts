import { INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface ISendSMSParams extends INodeFunctionBaseParams {
  config: {
    connection: {
      apiKey: string;
      subAccountId: string;
    };
    destination: string;
    text: string;
    source?: string;
    country?: string;
    encoding?: string;
    clientMessageId?: string;
    scheduled?: string;
    expiry?: string;
    dlrCallbackUrl?: string;
    clientIp?: string;
    track?: string;
    storeLocation: string;
    inputKey: string;
    contextKey: string;
  };
}
