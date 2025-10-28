import { createNodeDescriptor } from '@cognigy/extension-tools';
import endConversationNodeResolver from './resolvers/endConversationNodeResolver';

export const endConversationNode = createNodeDescriptor({
  type: 'endConversation',
  defaultLabel: 'End Conversation',
  summary: 'Removes user participant from the conversation and terminates the interaction',
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
      key: 'participantChatGatewayPatchRequest',
      label: '8x8 JSON properties',
      description: 'Configuration JSON for patch conversation',
      type: 'json',
      defaultValue: {
        removed: true
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
      defaultValue: 'endConversationResult',
      condition: {
        key: 'storeLocation',
        value: 'input'
      }
    },
    {
      key: 'contextKey',
      type: 'cognigyText',
      label: 'Context Key to store Result',
      defaultValue: 'endConversationResult',
      condition: {
        key: 'storeLocation',
        value: 'context'
      }
    }
  ],
  sections: [
    {
      key: 'participantChatGatewayPatchRequest',
      label: 'Participant Chat Gateway Patch Request',
      defaultCollapsed: true,
      fields: [
        'removed',
        'displayMessage'
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
    { type: 'field', key: 'participantChatGatewayPatchRequest' },
    { type: 'section', key: 'storage' }
  ],
  appearance: {
    color: '#ff0050'
  },
  function: endConversationNodeResolver
});
