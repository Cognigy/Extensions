import axios from 'axios';
import getWebhooksResponse from '../__mocks__/getWebhooksResponse';
import fetchWebhooks from './fetchWebhooks';

jest.mock('axios', () => jest.fn());
const mockAxios = axios as unknown as jest.Mock;

describe('api > fetchWebhooks()', () => {
  const mockParams = {
    apiKey: 'sdf23fqw-asdf-2q34f-q423-rarf',
    tenantId: 'mockTenant',
    baseUrl: 'https://8x8.com'
  };

  const { apiKey, tenantId, baseUrl } = mockParams;

  it('should make a GET request to Chat Gateway and return a list of webhooks response', async() => {
    mockAxios.mockResolvedValue({
      data: {
        _embedded: {
          webhooks: getWebhooksResponse()
        },
        page: {
          size: 3,
          totalElements: 3,
          totalPages: 1,
          number: 0
        }
      }
    });

    const data = await fetchWebhooks(apiKey, tenantId, baseUrl);

    expect(data).toEqual(getWebhooksResponse());
  });
});

