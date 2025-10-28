import type { Webhook } from '../types';

const CHAT_GATEWAY_VERSION = 'Chat Gateway v1.0';

const getWebhooksResponse = (): Webhook[] => (
  [
    {
      id: 'id1',
      name: 'name1',
      uri: '8x8_v1.com',
      version: CHAT_GATEWAY_VERSION
    },
    {
      id: 'id2',
      name: 'name2',
      uri: '8x8_v2.com',
      version: CHAT_GATEWAY_VERSION
    },
    {
      id: 'id3',
      name: 'name3',
      uri: '8x8_v3.com',
      version: CHAT_GATEWAY_VERSION
    }]
);

export default getWebhooksResponse;
