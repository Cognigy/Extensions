import type { INodeField } from '@cognigy/extension-tools/build/interfaces/descriptor';
import { addFilterKeyPrefix } from './filterPrefix';

const buildCustomFieldsNode = (): INodeField => ({
  key: addFilterKeyPrefix('customFields'),
  label: 'Custom Fields',
  type: 'json',
  description: 'Custom fields and their parameter names are added by the administrator of the tenant.',
  defaultValue: {}
});

export default buildCustomFieldsNode;
