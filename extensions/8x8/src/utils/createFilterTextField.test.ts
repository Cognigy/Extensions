import createFilterTextField from './createFilterTextField';

describe('utils > createFilterTextField', () => {
  it('should return node as expected', () => {
    const node = createFilterTextField({
      key: 'param',
      label: 'Label of param',
      description: 'Description of param'
    });

    expect(node).toStrictEqual({
      key: 'filter$param',
      label: 'Label of param',
      description: 'Description of param',
      type: 'cognigyText'
    });
  });
});
