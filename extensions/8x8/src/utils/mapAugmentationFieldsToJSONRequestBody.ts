import type { AugmentationVariable, DataAugmentationRequestBody } from '../nodes/dataAugmentation/api/postDataAugmentation';
import type { DataAugmentationParams } from '../nodes/dataAugmentation/types';

const isValid = (value: string): boolean => {
  return Boolean(value && (value !== ''));
};

const buildRequestBodyObject = (variablesArray: AugmentationVariable[], key: string, displayName: string, value: string): void => {
  variablesArray.push({
    name: key,
    value,
    ivr: 'true',
    display: 'true',
    displayName
  });
};

const mapAugmentationFieldsToJSONRequestBody = (augmentationFields: DataAugmentationParams): DataAugmentationRequestBody => {
  const {
    displayName1,
    value1,
    displayName2,
    value2,
    displayName3,
    value3,
    displayName4,
    value4,
    displayName5,
    value5
  } = augmentationFields;

  const requestBody = {
    data: {
      variables: []
    }
  };

  isValid(value1) && isValid(displayName1) && buildRequestBodyObject(requestBody.data.variables, 'variable1', displayName1, value1);
  isValid(value2) && isValid(displayName2) && buildRequestBodyObject(requestBody.data.variables, 'variable2', displayName2, value2);
  isValid(value3) && isValid(displayName3) && buildRequestBodyObject(requestBody.data.variables, 'variable3', displayName3, value3);
  isValid(value4) && isValid(displayName4) && buildRequestBodyObject(requestBody.data.variables, 'variable4', displayName4, value4);
  isValid(value5) && isValid(displayName5) && buildRequestBodyObject(requestBody.data.variables, 'variable5', displayName5, value5);

  return requestBody;
};

export default mapAugmentationFieldsToJSONRequestBody;
