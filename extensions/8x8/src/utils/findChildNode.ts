import type { INodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools';

export type TNodeChildConfigs = INodeFunctionBaseParams['childConfigs'][0];

const findChildNode = (childConfigs: TNodeChildConfigs[], node: INodeDescriptor): TNodeChildConfigs | null => {
  return childConfigs.find(child => child.type === node.type) ?? null;
};

export default findChildNode;
