import addToStorage from '../../../utils/addToStorage';
import type { RemoveParticipantRequestBody } from '../api/removeParticipant';
import removeParticipant from '../api/removeParticipant';
import type { IEndConversationParams } from '../types';

const endConversationNodeResolver = async({
  cognigy,
  config
}: IEndConversationParams): Promise<void> => {
  const { api, input } = cognigy;
  const {
    connection,
    participantChatGatewayPatchRequest,
    storeLocation,
    inputKey,
    contextKey
  } = config;
  const { tenantId, apiKey, baseUrl } = connection;

  const conversationId = input?.data?.request?.conversationId;
  const requestBody: RemoveParticipantRequestBody = {};

  // Only include fields that are explicitly provided
  if (participantChatGatewayPatchRequest?.removed != null) {
    requestBody.removed = participantChatGatewayPatchRequest.removed;
  }

  if (participantChatGatewayPatchRequest?.displayMessage != null) {
    requestBody.displayMessage = participantChatGatewayPatchRequest.displayMessage;
  }

  // If no configuration is provided, use default
  if (!participantChatGatewayPatchRequest || Object.keys(requestBody).length === 0) {
    requestBody.removed = true;
  }

  try {
    const result = await removeParticipant({
      apiKey,
      tenantId,
      baseUrl,
      conversationId,
      requestBody
    });

    addToStorage({
      api,
      data: result,
      storeLocation,
      contextKey,
      inputKey
    });
  } catch (error) {
    if (api.log) {
      api.log('error', error.message);
    }
  }
};

export default endConversationNodeResolver;
