import { createNodeDescriptor } from '@cognigy/extension-tools';
import createBasicChildNode from '../../utils/createBasicChildNode';
import getScheduleDropdownOptions from './resolvers/getScheduleDropdownOptions';
import scheduleNodeResolver from './resolvers/scheduleNodeResolver';

export const onOpenNode = createBasicChildNode({
  type: 'onOpenSchedule',
  defaultLabel: 'Schedule open',
  parentType: 'getSchedule'
});

export const onClosedNode = createBasicChildNode({
  type: 'onClosedSchedule',
  defaultLabel: 'Schedule closed',
  parentType: 'getSchedule'
});

export const onChoice1Node = createBasicChildNode({
  type: 'onChoice1',
  defaultLabel: 'Choice 1 Schedule',
  parentType: 'getSchedule'
});

export const onChoice2Node = createBasicChildNode({
  type: 'onChoice2',
  defaultLabel: 'Choice 2 Schedule',
  parentType: 'getSchedule'
});

export const onChoice3Node = createBasicChildNode({
  type: 'onChoice3',
  defaultLabel: 'Choice 3 Schedule',
  parentType: 'getSchedule'
});

export const onChoice4Node = createBasicChildNode({
  type: 'onChoice4',
  defaultLabel: 'Choice 4 Schedule',
  parentType: 'getSchedule'
});

export const onChoice5Node = createBasicChildNode({
  type: 'onChoice5',
  defaultLabel: 'Choice 5 Schedule',
  parentType: 'getSchedule'
});

export const onChoice6Node = createBasicChildNode({
  type: 'onChoice6',
  defaultLabel: 'Choice 6 Schedule',
  parentType: 'getSchedule'
});

export const getScheduleNode = createNodeDescriptor({
  type: 'getSchedule',
  defaultLabel: 'Check Schedule',
  fields: [
    {
      key: 'connection',
      label: '8x8 Check Schedule Connection',
      type: 'connection',
      params: {
        connectionType: 'eightbyeight',
        required: true
      }
    },
    {
      key: 'scheduleNameToID',
      label: 'Schedules',
      description: 'The ID of the schedule',
      type: 'select',
      params: {
        required: true
      },
      optionsResolver: {
        dependencies: ['connection'],
        resolverFunction: getScheduleDropdownOptions
      }
    },
    {
      key: 'storeLocation',
      type: 'select',
      label: 'Where to store the result',
      defaultValue: 'input',
      params: {
        options: [
          {
            label: 'Input',
            value: 'input'
          },
          {
            label: 'Context',
            value: 'context'
          }
        ],
        required: true
      }
    },
    {
      key: 'inputKey',
      type: 'cognigyText',
      label: 'Input Key to store Result',
      defaultValue: 'scheduleStatus',
      condition: {
        key: 'storeLocation',
        value: 'input'
      }
    },
    {
      key: 'contextKey',
      type: 'cognigyText',
      label: {
        default: 'Context Key to store Result'
      },
      defaultValue: 'scheduleStatus',
      condition: {
        key: 'storeLocation',
        value: 'context'
      }
    }
  ],
  sections: [
    {
      key: 'storage',
      label: 'Storage Option',
      defaultCollapsed: true,
      fields: [
        'storeLocation',
        'inputKey',
        'contextKey'
      ]
    }
  ],
  form: [
    { type: 'field', key: 'connection' },
    { type: 'field', key: 'scheduleNameToID' },
    { type: 'section', key: 'storage' }
  ],
  appearance: {
    color: '#ff0050'
  },
  dependencies: {
    children: [
      onOpenNode.type,
      onClosedNode.type,
      onChoice1Node.type,
      onChoice2Node.type,
      onChoice3Node.type,
      onChoice4Node.type,
      onChoice5Node.type,
      onChoice6Node.type
    ]
  },
  function: scheduleNodeResolver
});

