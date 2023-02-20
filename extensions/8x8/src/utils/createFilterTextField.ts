import type { INodeField } from '@cognigy/extension-tools/build/interfaces/descriptor';
import { addFilterKeyPrefix } from './filterPrefix';

const createFilterTextField = ({ key, label, description }: Omit<INodeField, 'type'>): INodeField => ({
  key: addFilterKeyPrefix(key),
  label,
  description,
  type: 'cognigyText'
});

export default createFilterTextField;
