/* eslint-disable @typescript-eslint/no-non-null-assertion */
import addToStorage from '../../../utils/addToStorage';
import mapAugmentationFieldsToJSONRequestBody from '../../../utils/mapAugmentationFieldsToJSONRequestBody';
import type { DataAugmentationRequestBody } from '../api/postDataAugmentation';
import postDataAugmentation from '../api/postDataAugmentation';
import type { IDataAugmentationParams } from '../types';

const dataAugmentationResolver = async({ cognigy, config }: IDataAugmentationParams): Promise<void> => {
  const { api } = cognigy;
  const { connection, sipCallId, useCustomFields, storeLocation, contextKey, inputKey } = config;
  const customFieldsJSONRequestBody = config.customFields as unknown as DataAugmentationRequestBody;
  const { tenantId, apiKey, baseUrl } = connection;

  try {
    let result = null;

    if (useCustomFields) {
      result = await postDataAugmentation(apiKey, tenantId, baseUrl, sipCallId, customFieldsJSONRequestBody);
    } else {
      const augmentationFieldsRequestBody = mapAugmentationFieldsToJSONRequestBody(config);
      result = await postDataAugmentation(apiKey, tenantId, baseUrl, sipCallId, JSON.stringify(augmentationFieldsRequestBody));
    }

    addToStorage({ api, data: result.status, storeLocation, contextKey, inputKey });
  } catch (error) {
    api.log!('error', error.message);
  }
};

export default dataAugmentationResolver;
