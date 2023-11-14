import { createExtension } from '@cognigy/extension-tools';
import { simpleConnection } from './connections/8x8SimpleConnection';
import { getCustomerNodes } from './nodes/customer';
import { getScheduleNodes } from './nodes/schedule';
import { getTestConditionOfQueueNode } from './nodes/testConditionOfQueue';
import { getCaseNodes } from './nodes/case';

export default createExtension({
  nodes: [
    ...getCustomerNodes(),
    ...getScheduleNodes(),
    ...getTestConditionOfQueueNode(),
    ...getCaseNodes()
  ],
  connections: [
    simpleConnection
  ],
  options: {
    label: '8x8'
  }
});
