import { XMLParser } from 'fast-xml-parser';

export const errorMessageInvalidResponse = 'Invalid response from WAPI';

const parser = new XMLParser({
  ignoreAttributes: false,
  numberParseOptions: {
    hex: false,
    leadingZeros: false
  }
});

const getParsedXMLItems = <T>(xmlData: string, mapFunc: (obj: Record<string, any>) => T): T[] => {
  const parsedData = parser.parse(xmlData, { allowBooleanAttributes: true });
  const reply = parsedData.WAPI?.REPLY;

  if (!reply?.['@_STATUS']) {
    throw new Error(errorMessageInvalidResponse);
  }

  if (reply['@_STATUS'] === '-1') {
    throw new Error(reply['@_ERROR_STR'] ?? 'No error message found');
  }

  if (!reply.ITEM) {
    return [];
  }

  const response = reply.ITEM;
  if (!Array.isArray(response)) {
    return [mapFunc(response)];
  }
  return response.map(data => mapFunc(data));
};

export default getParsedXMLItems;
