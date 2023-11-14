import axios from 'axios';
import type { QueueStatisticsApiResponse } from '../types';

interface FetchQueueStatisticsParams {
  queueId: string
  clusterBaseUrl: string
  tenantId: string
  apiKey: string
}

const fetchQueueStatistics = async({
  queueId,
  clusterBaseUrl,
  tenantId,
  apiKey
}: FetchQueueStatisticsParams): Promise<QueueStatisticsApiResponse | null> => {
  const response = await axios({
    url: `${clusterBaseUrl}/cc/v1/stats/rt/queue/${queueId}`,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-8x8-Tenant': tenantId,
      'x-api-key': apiKey
    }
  });
  return response.data?.queue ?? null;
};

export default fetchQueueStatistics;
