import { createExtension } from '@cognigy/extension-tools';
import { connection } from './connections/8x8Connection';
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
    connection
  ],
  options: {
    label: '8x8'
  }
});
