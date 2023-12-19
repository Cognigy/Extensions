import type { INodeDescriptor } from '@cognigy/extension-tools';
import { dataAugmentationNode } from './dataAugmentation';

export const getDataAugmentationNode = (): INodeDescriptor[] => ([
  dataAugmentationNode
]);
