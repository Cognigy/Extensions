import axios from 'axios';
import type { CustomerData } from '../types';
import mapFetchCustomersXmlResponseToJson from './utils/mapFetchCustomersXmlResponseToJson';

export interface FetchCustomerDataParams {
  apiKey: string
  tenantId: string
  filterXml: string
  baseUrl: string
}

const fetchCustomersData = async({ filterXml, apiKey, tenantId, baseUrl }: FetchCustomerDataParams): Promise<CustomerData[]> => {
  const response = await axios({
    method: 'POST',
    url: `${baseUrl}/cc/v1/wapi`,
    data: ` <COMMAND OBJECT="Customer" ACTION="GET">
        ${filterXml}
      </COMMAND>`,
    headers: {
      'Content-Type': 'application/xml',
      'X-8x8-Tenant': tenantId,
      'x-api-key': apiKey
    }
  });
  return mapFetchCustomersXmlResponseToJson(response.data);
};

export default fetchCustomersData;
