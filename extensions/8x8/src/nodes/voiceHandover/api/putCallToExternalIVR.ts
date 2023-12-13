import axios from 'axios';

export interface CustomFields {
  user: Record<string, unknown>
  assignment: {
    type: string
    id: string
  }
}

export interface PutCallToExternalIVRParams {
  apiKey: string
  tenantId: string
  baseUrl: string
  queueId: string
  sipCallId: string
  customFields: CustomFields
}

const putCallToExternalIVR = async(apiKey: string, tenantId: string, baseUrl: string, sipCallId: string, queueId: string, customFields: CustomFields): Promise<Response> => {
  const requestPayload = {
    user: {
      ...customFields
    },
    assignment: {
      type: 'queue',
      id: queueId
    }
  };

  const putCallToExternalIVRResponse = await axios({
    method: 'PUT',
    url: `${baseUrl}/voice-gateway/v1/external-ivr/call/${sipCallId}`,
    data: requestPayload,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-8x8-Tenant': tenantId,
      'x-api-key': apiKey
    }
  });

  return putCallToExternalIVRResponse.data;
};

export default putCallToExternalIVR;
