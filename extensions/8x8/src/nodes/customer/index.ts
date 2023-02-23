import type { INodeDescriptor } from '@cognigy/extension-tools';
import { getCustomerNode, onFoundCustomer, onNotFoundCustomer } from './getCustomer';

export const getCustomerNodes = (): INodeDescriptor[] => [
  getCustomerNode,
  onFoundCustomer,
  onNotFoundCustomer
];
