import { createNodeDescriptor } from '@cognigy/extension-tools';
import scheduleHandbackToBotFlowNodeResolver from './resolvers/scheduleHandbackToBotFlowNodeResolver';
import getWebhookDropdownOptions from './resolvers/getWebhookDropdownOptions';

export const scheduleHandbackToBotFlowNode = createNodeDescriptor({
  type: 'scheduleHandbackToBotFlow',
  defaultLabel: 'Schedule Handback to Bot Flow',
  summary: 'Schedules a post-agent handback to transition the conversation to a bot flow',
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
      key: 'id',
      label: 'Webhook ID',
      description: 'Select the webhook ID to handback to',
      type: 'select',
      params: {
        required: true,
        placeholder: 'Select webhook ID'
      },
      optionsResolver: {
        dependencies: ['connection'],
        resolverFunction: getWebhookDropdownOptions
      }
    },
    {
      key: 'type',
      label: 'Assignment Type',
      description: 'Type of assignment',
      type: 'select',
      defaultValue: 'webhook',
      params: {
        options: [
          { label: 'Webhook', value: 'webhook' }
        ],
        required: true
      }
    },
    {
      key: 'configuration',
      label: 'Configuration',
      description: 'Optional configuration JSON for the assignment',
      type: 'json',
      defaultValue: {
        notifyChannelWebhookIfExists: 'false',
        maxTotalMinutes: '300',
        userTimeoutInMinutes: '150'
      },
      params: {
        required: false
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
      defaultValue: 'handbackResult',
      condition: {
        key: 'storeLocation',
        value: 'input'
      }
    },
    {
      key: 'contextKey',
      type: 'cognigyText',
      label: 'Context Key to store Result',
      defaultValue: 'handbackResult',
      condition: {
        key: 'storeLocation',
        value: 'context'
      }
    }
  ],
  sections: [
    {
      key: 'assignment',
      label: 'Assignment Configuration',
      defaultCollapsed: true,
      fields: [
        'type',
        'configuration'
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
    { type: 'field', key: 'id' },
    { type: 'section', key: 'assignment' },
    { type: 'section', key: 'storage' }
  ],
  appearance: {
    color: '#ff0050'
  },
  function: scheduleHandbackToBotFlowNodeResolver
});
