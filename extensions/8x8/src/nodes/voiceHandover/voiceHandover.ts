import { createNodeDescriptor } from '@cognigy/extension-tools';
import voiceHandoverNodeResolver from './resolvers/voiceHandoverNodeResolver';
import { defaultJSONProperties } from './constants/defaultJSONProperties';

export const voiceHandoverNode = createNodeDescriptor({
  type: 'voiceHandover',
  defaultLabel: 'Voice Handover',
  summary: 'Forwards a call to the 8x8 Agent Desktop',
  fields: [
    {
      key: 'connection',
      label: '8x8 Connection',
      type: 'connection',
      params: {
        connectionType: 'eightbyeightsimple',
        required: true
      }
    },
    {
      key: 'handoverInitiated',
      label: 'Handover initiated message',
      description: 'A message that will be said once the handover is initiated',
      type: 'cognigyText',
      params: {
        required: false
      }
    },
    {
      key: 'queueId',
      label: '8x8 Queue ID',
      description: 'The ID of the queue',
      type: 'cognigyText',
      params: {
        required: true
      }
    },
    {
      key: 'sipCallId',
      label: '8x8 sip Call ID',
      description: 'The ID of the call',
      type: 'cognigyText',
      params: {
        required: true
      }
    },
    {
      key: 'customFields',
      label: '8x8 JSON properties',
      type: 'json',
      description: 'Extend 8x8 properties with custom JSON.',
      defaultValue: defaultJSONProperties
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
      key: 'settings',
      label: '8x8 Settings',
      defaultCollapsed: false,
      fields: [
        'queueId',
        'sipCallId',
        'customFields'
      ]
    },
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
    { type: 'field', key: 'handoverInitiated' },
    { type: 'section', key: 'settings' },
    { type: 'section', key: 'storage' }
  ],
  appearance: {
    color: '#ff0050'
  },
  function: voiceHandoverNodeResolver

});
