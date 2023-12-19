import { getDataAugmentationNode } from '../dataAugmentation/index';

describe('voice handover node > getDataAugmentationNode', () => {
  it('should create the node for data augmentation', () => {
    const nodes = getDataAugmentationNode();

    expect(nodes).toMatchSnapshot();
  });
});
