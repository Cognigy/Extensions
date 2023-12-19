import axios from 'axios';

export interface AugmentationVariable {
  name: string
  value: string
  ivr?: string
  display?: string
  displayName?: string
}

export interface DataAugmentationRequestBody {
  data: {
    variables: AugmentationVariable[]
  }
}

export interface PostDataAugmentationParams {
  apiKey: string
  tenantId: string
  baseUrl: string
  sipCallId: string
  requestBody: DataAugmentationRequestBody
}

const postDataAugmentation = async(apiKey: string, tenantId: string, baseUrl: string, sipCallId: string, requestBody: DataAugmentationRequestBody | string): Promise<Response> => {
  const postDataAugmentationResponse = await axios({
    method: 'POST',
    url: `${baseUrl}/cc/v1/eivr/interaction/data/callId/${sipCallId}`,
    data: requestBody,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-8x8-Tenant': tenantId,
      'x-api-key': apiKey
    }
  });

  return postDataAugmentationResponse.data;
};

export default postDataAugmentation;
