import type { SearchGenericParams } from '../types';
import { isValidFilterField, removeFilterKeyPrefix } from './filterPrefix';

const getXmlKey = (key: string): string => key.toUpperCase();

const isEmptyValue = (value: string): boolean => !value || (Boolean(value) && typeof value === 'string' && value.trim() === '');

const mapCustomFieldsToXml = (customFields: Record<string, string>): string => {
  return Object.entries(customFields)
    .filter(([_key, value]) => !isEmptyValue(value))
    .map(([key, value]) => {
      const xmlKey = getXmlKey(key);
      return `<${xmlKey}>${value}</${xmlKey}>`;
    })
    .join('');
};
const mapSearchParamsToXml = (searchParams: SearchGenericParams): string => {
  let xmlSearchParams = '';

  for (const [key, value] of Object.entries(searchParams)) {
    if (isEmptyValue(value)) continue;
    if (!isValidFilterField(key)) continue;
    if (key === 'filter$customFields') {
      xmlSearchParams += mapCustomFieldsToXml(value);
    } else {
      const xmlKey = getXmlKey(removeFilterKeyPrefix(key));
      xmlSearchParams += `<${xmlKey}>${value}</${xmlKey}>`;
    }
  }
  return xmlSearchParams;
};

export default mapSearchParamsToXml;
