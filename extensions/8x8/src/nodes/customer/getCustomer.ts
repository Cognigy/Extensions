import { createNodeDescriptor } from '@cognigy/extension-tools';
import type { INodeField, INodeFieldAndSectionFormElement } from '@cognigy/extension-tools/build/interfaces/descriptor';
import createBasicChildNode from '../../utils/createBasicChildNode';
import createFilterTextField from '../../utils/createFilterTextField';
import { addFilterKeyPrefix } from '../../utils/filterPrefix';
import getCustomerNodeResolver from './resolvers/getCustomerNodeResolver';

export const onFoundCustomer = createBasicChildNode({
  type: 'onFoundCustomer',
  parentType: 'getCustomer',
  defaultLabel: 'Customer found'
});

export const onNotFoundCustomer = createBasicChildNode({
  type: 'onNotFoundCustomer',
  parentType: 'getCustomer',
  defaultLabel: 'Customer not found'
});

const filterFields: INodeField[] = [
  createFilterTextField({
    key: 'firstName',
    label: 'First Name',
    description: 'Filter the customer by first name. Maximum 30 characters'
  }),
  createFilterTextField({
    key: 'lastName',
    label: 'Last Name',
    description: 'Filter the customer by last name. Maximum 30 characters'
  }),
  createFilterTextField({
    key: 'email',
    label: 'Email',
    description: 'Filter the customer by email. Maximum 55 characters'
  }),
  createFilterTextField({
    key: 'voice',
    label: 'Voice',
    description: 'Filter the customer by voice. Maximum 38 characters'
  }),
  createFilterTextField({
    key: 'company',
    label: 'Company',
    description: 'Filter the customer by company. Maximum 50 characters'
  }),
  createFilterTextField({
    key: 'accountNum',
    label: 'Account Number',
    description: 'Account number of the customer who is related to the case'
  }),
  createFilterTextField({
    key: 'customerType',
    label: 'Customer Type',
    description: `The contact type must be one valid type (not deactivated) as defined in Configuration Manager.
    The list of possible values is defined by the administrator of the tenant.`
  }),
  {
    key: addFilterKeyPrefix('customFields'),
    label: 'Custom Fields',
    type: 'json',
    description: 'Custom fields and their parameter names are added by the administrator of the tenant.',
    defaultValue: {}
  }
];

export const getCustomerNode = createNodeDescriptor({
  type: 'getCustomer',
  defaultLabel: 'Get Customer',
  summary: 'Retrieves customer details from 8x8 CRM',
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
      defaultValue: 'customer',
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
      defaultValue: 'customer',
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
      onFoundCustomer.type,
      onNotFoundCustomer.type
    ]
  },
  function: getCustomerNodeResolver
});

