import createBasicChildNode from './createBasicChildNode';

describe('createBasicChildNode', () => {
  it('should create a basic child node', () => {
    const type = 'getCustomer';
    const defaultLabel = 'Get Customer';
    const parentType = 'getCustomer';

    const node = createBasicChildNode({ type, defaultLabel, parentType });

    expect(node).toMatchSnapshot();
  });
});
