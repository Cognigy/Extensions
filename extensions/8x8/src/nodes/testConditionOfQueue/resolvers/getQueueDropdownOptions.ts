/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { IOptionsResolverReturnData } from '@cognigy/extension-tools/build/interfaces/descriptor';
import type { GetQueueDropdownOptionsParams, QueueApiResponse, QueueType } from '../types';

/**
 * We use this resolver to get the dropdown options for the queue selection.
 * Warning: we cant use external libraries or functions
 * @param {GetQueueDropdownOptionsParams} params - The resolver params
 * @returns {Promise<IOptionsResolverReturnData[]>} - An array of objects with label and value properties
 */
const getQueueDropdownOptions = async({ api, config }: GetQueueDropdownOptionsParams): Promise<IOptionsResolverReturnData[]> => {
  const queueType = {
    Chat: 'chat',
    Phone: 'phone',
    Email: 'email',
    Vmail: 'vmail'
  };
  const getDisplayType = (type: QueueType): string => {
    switch (type) {
      case queueType.Chat:
        return 'Chat';
      case queueType.Phone:
        return 'Phone';
      case queueType.Email:
        return 'Email';
      case queueType.Vmail:
        return 'Vmail';
      default:
        return 'Unknown';
    }
  };
  const addNamePrefix = (name: string, type: QueueType): string => `${getDisplayType(type)}: ${name}`;
  try {
    const { connection } = config;
    const { clusterBaseUrl, tenantId, dataRequestToken } = connection;
    const authToken = `${tenantId}:${dataRequestToken}`;

    const result = await api.httpRequest!({
      method: 'GET',
      url: `${clusterBaseUrl}/api/rtstats/stats/queues.json`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
        Authorization: `Basic ${Buffer.from(authToken).toString('base64')}`
      }
    });
    const { data } = result;
    if (!data?.queue) {
      throw new Error('No queues found');
    }
    const queues = data.queue as QueueApiResponse[];

    return queues.map(queue => ({
      label: addNamePrefix(queue['queue-name'], queue['media-type']),
      value: queue['queue-id'].toString()
    }));
  } catch (error) {
    throw new Error(error);
  }
};

export default getQueueDropdownOptions;
