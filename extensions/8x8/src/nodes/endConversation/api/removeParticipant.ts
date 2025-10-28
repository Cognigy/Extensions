import axios from 'axios';

export interface RemoveParticipantRequestBody {
  removed?: boolean
  displayMessage?: string
}

export interface RemoveParticipantParams {
  apiKey: string
  tenantId: string
  baseUrl: string
  conversationId: string
  requestBody: RemoveParticipantRequestBody
}

const removeParticipant = async(params: RemoveParticipantParams): Promise<Response> => {
  const { apiKey, tenantId, baseUrl, conversationId, requestBody } = params;
  
  const removeParticipantResponse = await axios({
    method: 'PATCH',
    url: `${baseUrl}/chat-gateway/v1/conversations/${conversationId}/participants/user`,
    data: requestBody,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-8x8-Tenant': tenantId,
      'x-api-key': apiKey
    }
  });

  return removeParticipantResponse.data;
};

export default removeParticipant;
