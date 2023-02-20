import buildCustomFieldsNode from './buildCustomFieldsNode';

describe('utils > buildCustomFieldsNode', () => {
  it('should create the nodes for customer logic', () => {
    const node = buildCustomFieldsNode();

    expect(node).toMatchSnapshot();
  });
});
