import type { IGetWebhooksDropdownOptionsParams, Webhook, WebhooksResponseBody } from '../types';
import getWebhookDropdownOptions from './getWebhookDropdownOptions';

describe('getWebhookDropdownOptions', () => {
  const api = {
    httpRequest: jest.fn()
  };

  const getMockWebhook = (id: string, name: string): Webhook => ({
    id,
    name,
    uri: `https://example.com/webhook/${id}`,
    version: '1.0'
  });

  const getMockParams = (): IGetWebhooksDropdownOptionsParams => {
    const config = {
      connection: {
        tenantId: 'mockTenantId',
        apiKey: 'mockApiKey',
        baseUrl: 'https://mock.baseurl.com'
      }
    };
    return {
      api,
      config
    } as unknown as IGetWebhooksDropdownOptionsParams;
  };

  const getMockResponse = (webhooks: Webhook[], page = 0, totalPages = 1): WebhooksResponseBody => ({
    _embedded: {
      webhooks
    },
    page: {
      number: page,
      size: 20,
      totalElements: webhooks.length,
      totalPages
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return webhook dropdown options for single page', async() => {
    const mockWebhook1 = getMockWebhook('1', 'Test Webhook 1');
    const mockWebhook2 = getMockWebhook('2', 'Test Webhook 2');
    const mockResponse = getMockResponse([mockWebhook1, mockWebhook2]);

    api.httpRequest.mockResolvedValue({ data: mockResponse });

    const result = await getWebhookDropdownOptions(getMockParams());

    expect(result).toEqual([
      { label: 'Test Webhook 1', value: '1' },
      { label: 'Test Webhook 2', value: '2' }
    ]);
    expect(api.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://mock.baseurl.com/chat-gateway/v1/webhooks?page=0&size=1000',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-8x8-Tenant': 'mockTenantId',
        'x-api-key': 'mockApiKey'
      }
    });
  });

  it('should handle multiple pages of webhooks', async() => {
    const mockWebhook1 = getMockWebhook('1', 'Webhook Page 1');
    const mockWebhook2 = getMockWebhook('2', 'Webhook Page 2');

    api.httpRequest
      .mockResolvedValueOnce({ data: getMockResponse([mockWebhook1], 0, 2) })
      .mockResolvedValueOnce({ data: getMockResponse([mockWebhook2], 1, 2) });

    const result = await getWebhookDropdownOptions(getMockParams());

    expect(result).toEqual([
      { label: 'Webhook Page 1', value: '1' },
      { label: 'Webhook Page 2', value: '2' }
    ]);
    expect(api.httpRequest).toHaveBeenCalledTimes(2);
  });

  it('should return empty array when no webhooks found', async() => {
    const mockResponse = getMockResponse([]);
    api.httpRequest.mockResolvedValue({ data: mockResponse });

    const result = await getWebhookDropdownOptions(getMockParams());

    expect(result).toEqual([]);
  });

  it('should handle response without _embedded field', async() => {
    api.httpRequest.mockResolvedValue({ data: {} });

    const result = await getWebhookDropdownOptions(getMockParams());

    expect(result).toEqual([]);
  });

  it('should handle response without page info', async() => {
    const mockWebhook = getMockWebhook('1', 'Single Webhook');
    api.httpRequest.mockResolvedValue({
      data: {
        _embedded: {
          webhooks: [mockWebhook]
        }
      }
    });

    const result = await getWebhookDropdownOptions(getMockParams());

    expect(result).toEqual([{ label: 'Single Webhook', value: '1' }]);
  });

  it('should throw an error when API request fails', async() => {
    const mockError = new Error('API request failed');
    api.httpRequest.mockRejectedValue(mockError);

    await expect(getWebhookDropdownOptions(getMockParams())).rejects.toThrow('API request failed');
  });

  it('should handle non-Error objects thrown by API', async() => {
    const mockError = 'String error';
    api.httpRequest.mockRejectedValue(mockError);

    await expect(getWebhookDropdownOptions(getMockParams())).rejects.toThrow('String error');
  });
});
