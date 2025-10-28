import type { INodeDescriptor } from '@cognigy/extension-tools';
import { scheduleHandbackToBotFlowNode } from './scheduleHandbackToBotFlow';

export const getScheduleHandbackToBotFlowNode = (): INodeDescriptor[] => [
  scheduleHandbackToBotFlowNode
];
