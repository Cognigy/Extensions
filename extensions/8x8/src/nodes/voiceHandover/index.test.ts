import { getVoiceHandoverNode } from './index';

describe('voice handover node > getVoiceHndoverNode', () => {
  it('should create the node for voice handover', () => {
    const nodes = getVoiceHandoverNode();

    expect(nodes).toMatchSnapshot();
  });
});
