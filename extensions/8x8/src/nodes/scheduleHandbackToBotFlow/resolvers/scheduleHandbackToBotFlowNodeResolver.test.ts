import addToStorage from '../../../utils/addToStorage';
import postAgentAssignment from '../api/postAgentAssignment';
import type { IScheduleHandbackToBotFlowParams } from '../types';
import StoreLocationName from '../../../constants/StoreLocationName';
import scheduleHandbackToBotFlowNodeResolver from './scheduleHandbackToBotFlowNodeResolver';

jest.mock('../../../utils/addToStorage');
jest.mock('../api/postAgentAssignment');

describe('scheduleHandoverToBotFlowNodeResolver', () => {
  const MOCK_TENANT_ID = 'test-tenant';
  const MOCK_API_KEY = 'test-api-key';
  const MOCK_BASE_URL = 'https://test.example.com';
  const MOCK_WEBHOOK_ID = 'webhook-123';
  const MOCK_CONVERSATION_ID = 'conversationId';
  const MOCK_WEBHOOK_TYPE = 'webhook';

  const mockApi = {
    log: jest.fn()
  };

  const getMockParams = (overrides = {}): IScheduleHandbackToBotFlowParams => {
    const config = {
      connection: {
        tenantId: MOCK_TENANT_ID,
        apiKey: MOCK_API_KEY,
        baseUrl: MOCK_BASE_URL
      },
      id: MOCK_WEBHOOK_ID,
      type: MOCK_WEBHOOK_TYPE,
      configuration: {
        notifyChannelWebhookIfExists: 'false',
        maxTotalMinutes: '300',
        userTimeoutInMinutes: '150'
      },
      storeLocation: StoreLocationName.Context,
      contextKey: 'handbackResult',
      inputKey: 'handbackResult',
      ...overrides
    };

    // Create a fresh copy of the mock objects to avoid test interference
    const mockCognigyInstance = {
      api: mockApi,
      input: {
        data: {
          request: {
            conversationId: MOCK_CONVERSATION_ID
          }
        }
      }
    };

    return {
      cognigy: mockCognigyInstance,
      config
    } as unknown as IScheduleHandbackToBotFlowParams;
  };

  const mockPostAgentAssignmentResponse = {
    id: 'assignment-123',
    status: 'created',
    conversationId: MOCK_CONVERSATION_ID
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (postAgentAssignment as jest.Mock).mockResolvedValue(mockPostAgentAssignmentResponse);
  });

  it('should successfully create handback assignment', async() => {
    const params = getMockParams();

    await scheduleHandbackToBotFlowNodeResolver(params);

    expect(postAgentAssignment).toHaveBeenCalledWith({
      apiKey: MOCK_API_KEY,
      tenantId: MOCK_TENANT_ID,
      baseUrl: MOCK_BASE_URL,
      conversationId: MOCK_CONVERSATION_ID,
      requestBody: {
        id: MOCK_WEBHOOK_ID,
        type: MOCK_WEBHOOK_TYPE,
        configuration: {
          notifyChannelWebhookIfExists: 'false',
          maxTotalMinutes: '300',
          userTimeoutInMinutes: '150'
        }
      }
    });

    expect(addToStorage).toHaveBeenCalledWith({
      api: mockApi,
      data: mockPostAgentAssignmentResponse,
      storeLocation: StoreLocationName.Context,
      contextKey: params.config.contextKey,
      inputKey: 'handbackResult'
    });
  });

  it('should use context storage when specified', async() => {
    const params = getMockParams({
      storeLocation: StoreLocationName.Context,
      contextKey: 'handbackData',
      inputKey: null
    });

    await scheduleHandbackToBotFlowNodeResolver(params);

    expect(addToStorage).toHaveBeenCalledWith({
      api: mockApi,
      data: mockPostAgentAssignmentResponse,
      storeLocation: StoreLocationName.Context,
      contextKey: 'handbackData',
      inputKey: null
    });
  });

  it('should handle missing configuration', async() => {
    const params = getMockParams({
      configuration: null
    });

    await scheduleHandbackToBotFlowNodeResolver(params);

    expect(postAgentAssignment).toHaveBeenCalledWith({
      apiKey: MOCK_API_KEY,
      tenantId: MOCK_TENANT_ID,
      baseUrl: MOCK_BASE_URL,
      conversationId: MOCK_CONVERSATION_ID,
      requestBody: {
        id: MOCK_WEBHOOK_ID,
        type: MOCK_WEBHOOK_TYPE,
        configuration: null
      }
    });
  });

  it('should handle missing conversationId in input', async() => {
    const paramsWithoutConversationId = getMockParams();
    if (paramsWithoutConversationId.cognigy.input.data?.request) {
      paramsWithoutConversationId.cognigy.input.data.request.conversationId = null;
    }

    await scheduleHandbackToBotFlowNodeResolver(paramsWithoutConversationId);

    expect(postAgentAssignment).toHaveBeenCalledWith({
      apiKey: MOCK_API_KEY,
      tenantId: MOCK_TENANT_ID,
      baseUrl: MOCK_BASE_URL,
      conversationId: null,
      requestBody: expect.any(Object)
    });
  });

  it('should handle postAgentAssignment API error', async() => {
    const mockError = new Error('API Error');
    (postAgentAssignment as jest.Mock).mockRejectedValue(mockError);

    const params = getMockParams();

    await scheduleHandbackToBotFlowNodeResolver(params);

    expect(mockApi.log).toHaveBeenCalledWith('error', 'API Error');
    expect(addToStorage).not.toHaveBeenCalled();
  });

  it('should handle missing api.log gracefully', async() => {
    const mockError = new Error('API Error');
    (postAgentAssignment as jest.Mock).mockRejectedValue(mockError);

    const paramsWithoutLog = getMockParams();

    // Should not throw error
    await expect(scheduleHandbackToBotFlowNodeResolver(paramsWithoutLog)).resolves.toBeUndefined();
    expect(addToStorage).not.toHaveBeenCalled();
  });

  it('should construct request body with minimal configuration', async() => {
    const params = getMockParams({
      configuration: {
        maxTotalMinutes: '600'
      }
    });

    await scheduleHandbackToBotFlowNodeResolver(params);

    expect(postAgentAssignment).toHaveBeenCalledWith({
      apiKey: MOCK_API_KEY,
      tenantId: MOCK_TENANT_ID,
      baseUrl: MOCK_BASE_URL,
      conversationId: MOCK_CONVERSATION_ID,
      requestBody: {
        id: MOCK_WEBHOOK_ID,
        type: MOCK_WEBHOOK_TYPE,
        configuration: {
          maxTotalMinutes: '600'
        }
      }
    });
  });
});
