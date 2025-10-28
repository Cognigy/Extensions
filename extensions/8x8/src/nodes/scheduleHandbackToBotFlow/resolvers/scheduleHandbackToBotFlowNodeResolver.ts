import addToStorage from '../../../utils/addToStorage';
import type { PostAgentAssignmentRequestBody } from '../api/postAgentAssignment';
import postAgentAssignment from '../api/postAgentAssignment';
import type { IScheduleHandbackToBotFlowParams } from '../types';

const scheduleHandbackToBotFlowNodeResolver = async({
  cognigy,
  config
}: IScheduleHandbackToBotFlowParams): Promise<void> => {
  const { api, input } = cognigy;
  const {
    connection,
    id,
    type,
    configuration,
    storeLocation,
    inputKey,
    contextKey
  } = config;
  const { tenantId, apiKey, baseUrl } = connection;

  const conversationId = input?.data?.request?.conversationId;
  const requestBody: PostAgentAssignmentRequestBody = {
    id,
    type,
    configuration
  };
  try {
    const result = await postAgentAssignment({
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

export default scheduleHandbackToBotFlowNodeResolver;
