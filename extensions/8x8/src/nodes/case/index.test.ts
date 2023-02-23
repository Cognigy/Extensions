import { getCaseNodes } from './index';

describe('customer > getCaseNodes', () => {
  it('should create the nodes for case logic', () => {
    const nodes = getCaseNodes();

    expect(nodes).toMatchSnapshot();
  });
});
