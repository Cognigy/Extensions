import {getScheduleHandbackToBotFlowNode} from './index';

describe('schedule handback to bot > getScheduleHandbackToBotFlowNode', () => {
  it('should create the node for handback to bot', () => {
    const nodes = getScheduleHandbackToBotFlowNode();

    expect(nodes).toMatchSnapshot();
  });
});
