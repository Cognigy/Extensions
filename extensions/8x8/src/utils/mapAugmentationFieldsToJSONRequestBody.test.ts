import mapAugmentationFieldsToJSONRequestBody from './mapAugmentationFieldsToJSONRequestBody';

describe('mapAugmentationFieldsToJSONRequestBody', () => {
  it('Should map augmentation fields to JSON request body with non-empty values', () => {
    const augmentationFields = {
      displayName1: 'Display1',
      value1: 'Value1',
      displayName2: 'Display2',
      value2: 'Value2',
      displayName3: 'Display3',
      value3: 'Value3',
      displayName4: 'Display4',
      value4: 'Value4',
      displayName5: 'Display5',
      value5: 'Value5'
    };

    const result = mapAugmentationFieldsToJSONRequestBody(augmentationFields);

    expect(result).toEqual({
      data: {
        variables: [
          { name: 'variable1', value: 'Value1', ivr: 'true', display: 'true', displayName: 'Display1' },
          { name: 'variable2', value: 'Value2', ivr: 'true', display: 'true', displayName: 'Display2' },
          { name: 'variable3', value: 'Value3', ivr: 'true', display: 'true', displayName: 'Display3' },
          { name: 'variable4', value: 'Value4', ivr: 'true', display: 'true', displayName: 'Display4' },
          { name: 'variable5', value: 'Value5', ivr: 'true', display: 'true', displayName: 'Display5' }
        ]
      }
    });
  });

  it('Should not include variables with empty values in the JSON request body', () => {
    const augmentationFields = {
      displayName1: 'Display1',
      value1: '',
      displayName2: 'Display2',
      value2: 'Value2',
      displayName3: 'Display3',
      value3: '',
      displayName4: 'Display4',
      value4: 'Value4',
      displayName5: 'Display5',
      value5: ''
    };

    const result = mapAugmentationFieldsToJSONRequestBody(augmentationFields);

    expect(result).toEqual({
      data: {
        variables: [
          { name: 'variable2', value: 'Value2', ivr: 'true', display: 'true', displayName: 'Display2' },
          { name: 'variable4', value: 'Value4', ivr: 'true', display: 'true', displayName: 'Display4' }
        ]
      }
    });
  });
});
