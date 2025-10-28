import addToStorage from '../../../utils/addToStorage';
import removeParticipant from '../api/removeParticipant';
import type { IEndConversationParams } from '../types';
import StoreLocationName from '../../../constants/StoreLocationName';
import endConversationNodeResolver from './endConversationNodeResolver';

jest.mock('../../../utils/addToStorage');
jest.mock('../api/removeParticipant');

const MOCK_TENANT_ID = 'test-tenant';
const MOCK_API_KEY = 'test-api-key';
const MOCK_BASE_URL = 'https://test.example.com';
const MOCK_CONVERSATION_ID = 'test-conversation-id';
const MOCK_DISPLAY_MESSAGE = 'Bot flow ended';

const mockApi = {
  log: jest.fn()
};

const getMockParams = (overrides = {}): IEndConversationParams => {
  const config = {
    connection: {
      tenantId: MOCK_TENANT_ID,
      apiKey: MOCK_API_KEY,
      baseUrl: MOCK_BASE_URL
    },
    participantChatGatewayPatchRequest: {
      removed: true,
      displayMessage: MOCK_DISPLAY_MESSAGE
    },
    storeLocation: StoreLocationName.Context,
    contextKey: 'endConversationResult',
    inputKey: 'endConversationResult',
    ...overrides
  };

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
  } as unknown as IEndConversationParams;
};

const mockRemoveParticipantResponse = {
  id: 'participant-123',
  status: 'removed',
  conversationId: MOCK_CONVERSATION_ID
};

describe('endConversationNodeResolver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (removeParticipant as jest.Mock).mockResolvedValue(mockRemoveParticipantResponse);
  });

  it('should successfully remove participant from conversation', async() => {
    const params = getMockParams();

    await endConversationNodeResolver(params);

    expect(removeParticipant).toHaveBeenCalledWith({
      apiKey: MOCK_API_KEY,
      tenantId: MOCK_TENANT_ID,
      baseUrl: MOCK_BASE_URL,
      conversationId: MOCK_CONVERSATION_ID,
      requestBody: {
        removed: true,
        displayMessage: MOCK_DISPLAY_MESSAGE
      }
    });

    expect(addToStorage).toHaveBeenCalledWith({
      api: mockApi,
      data: mockRemoveParticipantResponse,
      storeLocation: StoreLocationName.Context,
      contextKey: params.config.contextKey,
      inputKey: 'endConversationResult'
    });
  });

  it('should use context storage when specified', async() => {
    const params = getMockParams({
      storeLocation: StoreLocationName.Context,
      contextKey: 'endConversationData',
      inputKey: null
    });

    await endConversationNodeResolver(params);

    expect(addToStorage).toHaveBeenCalledWith({
      api: mockApi,
      data: mockRemoveParticipantResponse,
      storeLocation: StoreLocationName.Context,
      contextKey: 'endConversationData',
      inputKey: null
    });
  });

  it('should use default configuration when not provided', async() => {
    const params = getMockParams({
      configuration: null
    });

    await endConversationNodeResolver(params);

    expect(removeParticipant).toHaveBeenCalledWith({
      apiKey: MOCK_API_KEY,
      tenantId: MOCK_TENANT_ID,
      baseUrl: MOCK_BASE_URL,
      conversationId: MOCK_CONVERSATION_ID,
      requestBody: {
        removed: true,
        displayMessage: MOCK_DISPLAY_MESSAGE
      }
    });
  });

  it('should handle custom configuration', async() => {
    const params = getMockParams({
      participantChatGatewayPatchRequest: {
        removed: true,
        displayMessage: 'Custom ending message'
      }
    });

    await endConversationNodeResolver(params);

    expect(removeParticipant).toHaveBeenCalledWith({
      apiKey: MOCK_API_KEY,
      tenantId: MOCK_TENANT_ID,
      baseUrl: MOCK_BASE_URL,
      conversationId: MOCK_CONVERSATION_ID,
      requestBody: {
        removed: true,
        displayMessage: 'Custom ending message'
      }
    });
  });

  it('should handle missing conversationId in input', async() => {
    const paramsWithoutConversationId = getMockParams();
    if (paramsWithoutConversationId.cognigy.input.data?.request) {
      paramsWithoutConversationId.cognigy.input.data.request.conversationId = null;
    }

    await endConversationNodeResolver(paramsWithoutConversationId);

    expect(removeParticipant).toHaveBeenCalledWith({
      apiKey: MOCK_API_KEY,
      tenantId: MOCK_TENANT_ID,
      baseUrl: MOCK_BASE_URL,
      conversationId: null,
      requestBody: expect.any(Object)
    });
  });

  it('should handle removeParticipant API error', async() => {
    const mockError = new Error('API Error');
    (removeParticipant as jest.Mock).mockRejectedValue(mockError);

    const params = getMockParams();

    await endConversationNodeResolver(params);

    expect(mockApi.log).toHaveBeenCalledWith('error', 'API Error');
    expect(addToStorage).not.toHaveBeenCalled();
  });

  it('should handle missing api.log gracefully', async() => {
    const mockError = new Error('API Error');
    (removeParticipant as jest.Mock).mockRejectedValue(mockError);

    const paramsWithoutLog = getMockParams();

    await expect(endConversationNodeResolver(paramsWithoutLog)).resolves.toBeUndefined();
    expect(addToStorage).not.toHaveBeenCalled();
  });

  it('should handle configuration with removed=false', async() => {
    const params = getMockParams({
      participantChatGatewayPatchRequest: {
        removed: false,
        displayMessage: 'Not removing participant'
      }
    });

    await endConversationNodeResolver(params);

    expect(removeParticipant).toHaveBeenCalledWith({
      apiKey: MOCK_API_KEY,
      tenantId: MOCK_TENANT_ID,
      baseUrl: MOCK_BASE_URL,
      conversationId: MOCK_CONVERSATION_ID,
      requestBody: {
        removed: false,
        displayMessage: 'Not removing participant'
      }
    });
  });
});
