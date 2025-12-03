import type { IOptionsResolverReturnData } from '@cognigy/extension-tools/build/interfaces/descriptor';
import type { IGetWebhooksDropdownOptionsParams, Webhook, WebhooksResponseBody } from '../types';

const getWebhookDropdownOptions = async({ api, config }: IGetWebhooksDropdownOptionsParams): Promise<IOptionsResolverReturnData[]> => {
  try {
    const { apiKey, tenantId, baseUrl } = config.connection;
    const allWebhooks: Webhook[] = [];
    let page = 0;
    let hasMorePages = true;

    while (hasMorePages) {
      if (!api.httpRequest) {
        throw new Error('HTTP request API not available');
      }

      const result = await api.httpRequest({
        method: 'GET',
        url: `${baseUrl}/chat-gateway/v1/webhooks?page=${page}&size=1000`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-8x8-Tenant': tenantId,
          'x-api-key': apiKey
        }
      });

      const data = result.data as WebhooksResponseBody;

      if (data._embedded?.webhooks && data._embedded.webhooks.length > 0) {
        allWebhooks.push(...data._embedded.webhooks);
      }

      if (data.page) {
        hasMorePages = (page + 1) < data.page.totalPages;
        page += 1;
      } else {
        hasMorePages = false;
      }
    }

    return allWebhooks.map(webhook => ({
      label: webhook.name,
      value: webhook.id.toString()
    }));
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

export default getWebhookDropdownOptions;
