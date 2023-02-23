import { getCustomerNodes } from './index';

describe('customer > getCustomerNodes', () => {
  it('should create the nodes for customer logic', () => {
    const nodes = getCustomerNodes();

    expect(nodes).toMatchSnapshot();
  });
});
