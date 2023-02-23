import type { INodeDescriptor } from '@cognigy/extension-tools';
import { onConditionMatchedNode, testConditionOfQueueNode, onConditionNotMatchedNode } from './testConditionOfQueue';

export const getTestConditionOfQueueNode = (): INodeDescriptor[] => ([
  testConditionOfQueueNode,
  onConditionMatchedNode,
  onConditionNotMatchedNode
]);
