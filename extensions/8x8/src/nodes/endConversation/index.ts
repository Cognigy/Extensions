import type { INodeDescriptor } from '@cognigy/extension-tools';
import { endConversationNode } from './endConversation';

export const getEndConversationNode = (): INodeDescriptor[] => [
  endConversationNode
];
