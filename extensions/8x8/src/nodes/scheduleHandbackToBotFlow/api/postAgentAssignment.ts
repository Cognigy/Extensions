import axios from 'axios';

export interface PostAgentAssignmentRequestBody {
  id: string
  type: string
  configuration?: {
    notifyChannelWebhookIfExists?: string
    maxTotalMinutes?: string
    userTimeoutInMinutes?: string
  }
}

export interface PostAgentAssignmentParams {
  apiKey: string
  tenantId: string
  baseUrl: string
  conversationId: string
  requestBody: PostAgentAssignmentRequestBody | string
}

const postAgentAssignment = async(params: PostAgentAssignmentParams): Promise<Response> => {
  const { apiKey, tenantId, baseUrl, conversationId, requestBody } = params;
  
  const postAgentAssignmentResponse = await axios({
    method: 'POST',
    url: `${baseUrl}/chat-gateway/v1/conversations/${conversationId}/post-agent-assignment`,
    data: requestBody,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-8x8-Tenant': tenantId,
      'x-api-key': apiKey
    }
  });

  return postAgentAssignmentResponse.data;
};

export default postAgentAssignment;

