import { createNodeDescriptor } from '@cognigy/extension-tools';
import type { INodeField, INodeFieldAndSectionFormElement } from '@cognigy/extension-tools/build/interfaces/descriptor';
import createBasicChildNode from '../../utils/createBasicChildNode';
import createFilterTextField from '../../utils/createFilterTextField';
import buildCustomFieldsNode from '../../utils/buildCustomFieldsNode';
import getCaseNodeResolver from './resolvers/getCaseNodeResolver';

export const onFoundCase = createBasicChildNode({
  type: 'onFoundCase',
  parentType: 'getCase',
  defaultLabel: 'Case found'
});

export const onNotFoundCase = createBasicChildNode({
  type: 'onNotFoundCase',
  parentType: 'getCase',
  defaultLabel: 'Case not found'
});

const filterFields: INodeField[] = [
  createFilterTextField({
    key: 'caseNum',
    label: 'Case Number',
    description: 'Filter the case by case number. Maximum 30 characters'
  }),
  createFilterTextField({
    key: 'accountNum',
    label: 'Account Number',
    description: 'Filter the case by account number. Maximum 30 characters'
  }),
  createFilterTextField({
    key: 'lastName',
    label: 'Last name of customer',
    description: 'Filter the case by last name of customer. Maximum 30 characters. Supports partial strings'
  }),
  createFilterTextField({
    key: 'company',
    label: 'Company',
    description: 'Filter the case by company. Maximum 50 characters. Supports partial strings'
  }),
  createFilterTextField({
    key: 'status',
    label: 'Case Status',
    description: 'Filter the case by case status. Maximum 30 characters'
  }),
  createFilterTextField({
    key: 'project',
    label: 'Project',
    description: 'Filter the case by project. Maximum 30 characters'
  }),
  createFilterTextField({
    key: 'subject',
    label: 'Subject',
    description: 'Filter the case by case subject. Maximum 50 characters. Supports partial strings'
  }),
  buildCustomFieldsNode()
];

export const getCaseNode = createNodeDescriptor({
  type: 'getCase',
  defaultLabel: 'Get Case',
  summary: 'Retrieves case details from 8x8 CRM',
  fields: [
    {
      key: 'connection',
      label: '8x8 CRM Connection',
      type: 'connection',
      params: {
        connectionType: 'eightbyeight',
        required: true
      }
    },
    ...filterFields,
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
      defaultValue: 'case',
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
      defaultValue: 'case',
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
    ...(filterFields.map(field => ({ type: 'field', key: field.key })) as INodeFieldAndSectionFormElement[]),
    { type: 'section', key: 'storage' }
  ],
  appearance: {
    color: '#ff0050'
  },
  dependencies: {
    children: [
      onFoundCase.type,
      onNotFoundCase.type
    ]
  },
  function: getCaseNodeResolver
});
