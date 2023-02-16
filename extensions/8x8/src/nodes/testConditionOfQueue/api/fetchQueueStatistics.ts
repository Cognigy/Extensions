import axios from 'axios';
import type { QueueStatisticsApiResponse } from '../types';

interface FetchQueueStatisticsParams {
  queueId: string
  clusterBaseUrl: string
  tenantId: string
  dataRequestToken: string
}

const fetchQueueStatistics = async({
  queueId,
  clusterBaseUrl,
  tenantId,
  dataRequestToken
}: FetchQueueStatisticsParams): Promise<QueueStatisticsApiResponse | null> => {
  const authToken = `${tenantId}:${dataRequestToken}`;
  const response = await axios({
    url: `${clusterBaseUrl}/api/rtstats/stats/queue/${queueId}.json`,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'cache-control': 'no-cache',
      Authorization: `Basic ${Buffer.from(authToken).toString('base64')}`
    }
  });
  return response.data?.queue ?? null;
};

export default fetchQueueStatistics;
