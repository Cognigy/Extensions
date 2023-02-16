import { getTestConditionOfQueueNode } from './index';

describe('test condition of queue > getTestConditionOfQueueNode', () => {
  it('should create the nodes for test condition of queue', () => {
    const nodes = getTestConditionOfQueueNode();

    expect(nodes).toMatchSnapshot();
  });
});
