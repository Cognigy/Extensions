import type { QueueStatisticsApiResponse } from '../types';

const getQueueStatisticsResponse = (): QueueStatisticsApiResponse => ({
  'agent-count-busy': 0,
  'agent-count-loggedOut': 0,
  'agent-count-onBreak': 0,
  'agent-count-postProcess': 0,
  'agent-count-waitTransact': 0,
  'agent-count-workOffline': 0,
  'day-abandoned': 0,
  'day-accepted': 0,
  'day-avg-duration': 0,
  'day-avg-wait-time': 0,
  'day-queued': 0,
  'day-sla-activity': 0,
  'assigned-agent-count': 0,
  'enabled-agent-count': 0,
  'longest-wait-time': 0,
  'media-type': 'chat',
  'number-in-offered': 0,
  'number-in-progress': 0,
  'queue-id': 0,
  'queue-name': '',
  'queue-size': 0,
  'queue-type': '',
  'sla-activity': 0,
  'sla-target': 0,
  'thirty-min-abandoned': 0,
  'thirty-min-accepted': 0,
  'thirty-min-avg-duration': 0,
  'thirty-min-avg-wait-time': 0,
  'thirty-min-longest-wait-time': 0,
  'thirty-min-queued': 0,
  'thirty-min-sla-activity': 0
});

export default getQueueStatisticsResponse;
