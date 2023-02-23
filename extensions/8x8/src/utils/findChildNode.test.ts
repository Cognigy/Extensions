import type { INodeDescriptor } from '@cognigy/extension-tools/build';
import type { TNodeChildConfigs } from './findChildNode';
import findChildNode from './findChildNode';

describe('findChildNode', () => {
  it('should return null if no childConfigs are provided', () => {
    const childConfigs: TNodeChildConfigs[] = [];
    const node: INodeDescriptor = {
      type: 'test'
    } as unknown as INodeDescriptor;
    const result = findChildNode(childConfigs, node);
    expect(result).toBeNull();
  });
  it('should return the child node', () => {
    const childConfigs = [
      {
        type: 'onOpenNode'
      },
      {
        type: 'onClosedNode'
      }
    ] as TNodeChildConfigs[];
    const node = {
      type: 'onClosedNode'
    } as unknown as INodeDescriptor;
    const result = findChildNode(childConfigs, node);
    expect(result).toEqual({
      type: 'onClosedNode'
    });
  });
}
);

