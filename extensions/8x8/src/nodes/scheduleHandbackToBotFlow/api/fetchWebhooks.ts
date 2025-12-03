import axios from 'axios';
import type { Webhook, WebhooksResponseBody } from '../types';

const fetchWebhooks = async(apiKey: string, tenantId: string, baseUrl: string): Promise<Webhook[]> => {
  const allWebhooks: Webhook[] = [];
  let page = 0;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await axios({
        method: 'GET',
        url: `${baseUrl}/chat-gateway/v1/webhooks`,
        params: {
          page,
          size: 50 // Adjust page size as needed
        },
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-8x8-Tenant': tenantId,
          'x-api-key': apiKey
        }
      });

      const data = response.data as WebhooksResponseBody;

      if (data._embedded.webhooks && data._embedded.webhooks.length > 0) {
        allWebhooks.push(...data._embedded.webhooks);
      }

      // Check if there are more pages
      if (data.page) {
        hasMorePages = (page + 1) < data.page.totalPages;
        page += 1;
      } else {
        hasMorePages = false;
      }
    } catch (error) {
      throw new Error(`Failed to fetch webhooks: ${error.message}`);
    }
  }

  return allWebhooks;
};

export default fetchWebhooks;
