import { getEndConversationNode } from './index';

describe('end conversation > getEndConversationNode', () => {
  it('should create the node for end conversation', () => {
    const nodes = getEndConversationNode();

    expect(nodes).toMatchSnapshot();
  });
});
