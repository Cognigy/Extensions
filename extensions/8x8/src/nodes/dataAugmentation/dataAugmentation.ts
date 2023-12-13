import { createNodeDescriptor } from '@cognigy/extension-tools';
import type { INodeField } from '@cognigy/extension-tools/build/interfaces/descriptor';
import { defaultJSONProperties } from './constants/defaultJSONProperties';
import dataAugmentationResolver from './resolvers/dataAugmentationResolver';
import {
  DISPLAY_NAME_DESCRIPTION,
  DISPLAY_NAME_TITLE,
  VALUE_FIELD_TITLE,
  VALUE_FIELD_DESCRIPTION
} from './constants/labels';

const augmentationFieldsSection1: INodeField[] = [
  {
    key: 'displayName1',
    label: DISPLAY_NAME_TITLE,
    description: DISPLAY_NAME_DESCRIPTION,
    type: 'cognigyText'
  },
  {
    key: 'value1',
    label: VALUE_FIELD_TITLE,
    description: VALUE_FIELD_DESCRIPTION,
    type: 'cognigyText'
  }

];

const augmentationFieldsSection2: INodeField[] = [
  {
    key: 'displayName2',
    label: DISPLAY_NAME_TITLE,
    description: DISPLAY_NAME_DESCRIPTION,
    type: 'cognigyText'
  },
  {
    key: 'value2',
    label: VALUE_FIELD_TITLE,
    description: VALUE_FIELD_DESCRIPTION,
    type: 'cognigyText'
  }

];

const augmentationFieldsSection3: INodeField[] = [
  {
    key: 'displayName3',
    label: DISPLAY_NAME_TITLE,
    description: DISPLAY_NAME_DESCRIPTION,
    type: 'cognigyText'
  },
  {
    key: 'value3',
    label: VALUE_FIELD_TITLE,
    description: VALUE_FIELD_DESCRIPTION,
    type: 'cognigyText'
  }

];

const augmentationFieldsSection4: INodeField[] = [
  {
    key: 'displayName4',
    label: DISPLAY_NAME_TITLE,
    description: DISPLAY_NAME_DESCRIPTION,
    type: 'cognigyText'
  },
  {
    key: 'value4',
    label: VALUE_FIELD_TITLE,
    description: VALUE_FIELD_DESCRIPTION,
    type: 'cognigyText'
  }

];

const augmentationFieldsSection5: INodeField[] = [
  {
    key: 'displayName5',
    label: DISPLAY_NAME_TITLE,
    description: DISPLAY_NAME_DESCRIPTION,
    type: 'cognigyText'
  },
  {
    key: 'value5',
    label: VALUE_FIELD_TITLE,
    description: VALUE_FIELD_DESCRIPTION,
    type: 'cognigyText'
  }
];

export const dataAugmentationNode = createNodeDescriptor({
  type: 'dataAugmentation',
  defaultLabel: 'Data Augmentation',
  summary: 'Sends a payload with variables to enrich the properties served to the agent',
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
      key: 'sipCallId',
      label: '8x8 sip Call ID',
      description: 'The ID of the call',
      type: 'cognigyText',
      params: {
        required: true
      }
    },
    ...augmentationFieldsSection1,
    ...augmentationFieldsSection2,
    ...augmentationFieldsSection3,
    ...augmentationFieldsSection4,
    ...augmentationFieldsSection5,
    {
      key: 'useCustomFields',
      type: 'toggle',
      label: {
        default: 'Use JSON Fields to configure payload'
      },
      description: {
        default: 'Use JSON for defining payload for Data Augmentation.'
      },
      defaultValue: false
    },
    {
      key: 'customFields',
      label: '8x8 Data Augmentation JSON properties',
      type: 'json',
      description: 'Send 8x8 properties with custom JSON for Data Augmentation payload, default value provided for payload structure model.',
      defaultValue: defaultJSONProperties,
      params: {
        required: true
      },
      condition: {
        key: 'useCustomFields',
        value: true
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
      key: 'augmentationSection1',
      label: 'Data Augmentation payload value section 1',
      defaultCollapsed: false,
      fields: [
        ...(augmentationFieldsSection1.map(field => field.key))
      ],
      condition: {
        key: 'useCustomFields',
        value: false
      }
    },
    {
      key: 'augmentationSection2',
      label: 'Data Augmentation payload value section 2',
      defaultCollapsed: false,
      fields: [
        ...(augmentationFieldsSection2.map(field => field.key))
      ],
      condition: {
        key: 'useCustomFields',
        value: false
      }
    },
    {
      key: 'augmentationSection3',
      label: 'Data Augmentation payload value section 3',
      defaultCollapsed: false,
      fields: [
        ...(augmentationFieldsSection3.map(field => field.key))
      ],
      condition: {
        key: 'useCustomFields',
        value: false
      }
    },
    {
      key: 'augmentationSection4',
      label: 'Data Augmentation payload value section 4',
      defaultCollapsed: false,
      fields: [
        ...(augmentationFieldsSection4.map(field => field.key))
      ],
      condition: {
        key: 'useCustomFields',
        value: false
      }
    },
    {
      key: 'augmentationSection5',
      label: 'Data Augmentation payload value section 5',
      defaultCollapsed: false,
      fields: [
        ...(augmentationFieldsSection5.map(field => field.key))
      ],
      condition: {
        key: 'useCustomFields',
        value: false
      }
    },
    {
      key: 'jsonPayload',
      label: 'Data Augmentation JSON payload',
      defaultCollapsed: false,
      fields: [
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
    { type: 'field', key: 'sipCallId' },
    { type: 'field', key: 'useCustomFields' },
    { type: 'section', key: 'augmentationSection1' },
    { type: 'section', key: 'augmentationSection2' },
    { type: 'section', key: 'augmentationSection3' },
    { type: 'section', key: 'augmentationSection4' },
    { type: 'section', key: 'augmentationSection5' },
    { type: 'section', key: 'jsonPayload' },
    { type: 'section', key: 'storage' }
  ],
  appearance: {
    color: '#ff0050'
  },
  function: dataAugmentationResolver

});
