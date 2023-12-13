/* eslint-disable @typescript-eslint/no-non-null-assertion */
import addToStorage from '../../../utils/addToStorage';
import type { CustomFields } from '../api/putCallToExternalIVR';
import putCallToExternalIVR from '../api/putCallToExternalIVR';
import type { IHandoverToVoiceQueueParams } from '../types';

const voiceHandoverNodeResolver = async({ cognigy, config }: IHandoverToVoiceQueueParams): Promise<void> => {
  const { api } = cognigy;
  const { connection, handoverInitiated, sipCallId, queueId, storeLocation, contextKey, inputKey } = config;
  const customFieldsJSON = config.customFields as unknown as CustomFields;
  const { tenantId, apiKey, baseUrl } = connection;

  try {
    api.say!(handoverInitiated);

    const result = await putCallToExternalIVR(apiKey, tenantId, baseUrl, sipCallId, queueId, customFieldsJSON);

    addToStorage({ api, data: result.status, storeLocation, contextKey, inputKey });
  } catch (error) {
    api.log!('error', error.message);
  }
};

export default voiceHandoverNodeResolver;
