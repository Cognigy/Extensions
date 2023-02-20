import type { INodeDescriptor } from '@cognigy/extension-tools';
import { getCaseNode, onFoundCase, onNotFoundCase } from './getCase';

export const getCaseNodes = (): INodeDescriptor[] => [
  getCaseNode,
  onFoundCase,
  onNotFoundCase
];
