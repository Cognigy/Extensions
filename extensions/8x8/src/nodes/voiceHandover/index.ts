import type { INodeDescriptor } from '@cognigy/extension-tools';
import { voiceHandoverNode } from './voiceHandover';

export const getVoiceHandoverNode = (): INodeDescriptor[] => ([
  voiceHandoverNode
]);
