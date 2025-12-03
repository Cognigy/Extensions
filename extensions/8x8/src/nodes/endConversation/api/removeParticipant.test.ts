import axios from 'axios';
import type { RemoveParticipantParams } from './removeParticipant';
import removeParticipant from './removeParticipant';

jest.mock('axios', () => jest.fn());
const mockAxios = axios as unknown as jest.Mock;

describe('api > removeParticipant()', () => {
  const mockParams: RemoveParticipantParams = {
    apiKey: 'sdf23fqw-asdf-2q34f-q423-rarf',
    tenantId: 'mockTenant',
    baseUrl: 'https://8x8.com',
    conversationId: 'conversationId',
    requestBody: {
      removed: true,
      displayMessage: 'Bot flow ended'
    }
  };


  it('should make a PATCH request to Chat Gateway to remove the user from a conversation, terminating the interaction', async() => {
    mockAxios.mockResolvedValue({});

    await removeParticipant(mockParams);

    expect(mockAxios).toHaveBeenCalled();
  });
});

