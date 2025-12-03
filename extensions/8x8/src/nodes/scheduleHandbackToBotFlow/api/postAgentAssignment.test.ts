import axios from 'axios';
import type { PostAgentAssignmentParams } from './postAgentAssignment';
import postAgentAssignment from './postAgentAssignment';

jest.mock('axios', () => jest.fn());
const mockAxios = axios as unknown as jest.Mock;

describe('api > postAgentAssignment()', () => {
  const mockParams: PostAgentAssignmentParams = {
    apiKey: 'sdf23fqw-asdf-2q34f-q423-rarf',
    tenantId: 'mockTenant',
    baseUrl: 'https://8x8.com',
    conversationId: '9jIczlQm7mbIVzgpIp-Oxze83Oo',
    requestBody: {

      id: '3Q9fhaFLT9y_ChyNpAU4uQ',
      type: 'webhook',
      configuration:
        {
          notifyChannelWebhookIfExists: 'false',
          maxTotalMinutes: '300',
          userTimeoutInMinutes: '150'
        }
    }
  };


  it('should make a POST request to Chat Gateway and return a successful response', async() => {
    mockAxios.mockResolvedValue({});

    await postAgentAssignment(mockParams);

    expect(mockAxios).toHaveBeenCalled();
  });
});

