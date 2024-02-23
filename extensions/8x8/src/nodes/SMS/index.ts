import type { INodeDescriptor } from "@cognigy/extension-tools";
import { onErrorSMS, onSuccessSMS, sendSMSNode } from "./sendSMS";

export const getSMSNodes = (): INodeDescriptor[] => [
  sendSMSNode,
  onSuccessSMS,
  onErrorSMS,
];
