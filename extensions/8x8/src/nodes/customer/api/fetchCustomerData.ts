import axios from 'axios';
import type { CustomerData } from '../types';
import mapFetchCustomersXmlResponseToJson from './utils/mapFetchCustomersXmlResponseToJson';

export interface FetchCustomerDataParams {
  tenantId: string
  crmApiUsername: string
  crmApiPassword: string
  filterXml: string
  clusterBaseUrl: string
}

const fetchCustomersData = async({ filterXml, crmApiPassword, tenantId, crmApiUsername, clusterBaseUrl }: FetchCustomerDataParams): Promise<CustomerData[]> => {
  const response = await axios({
    method: 'POST',
    url: `${clusterBaseUrl}/WAPI/wapi.php`,
    data: `xml_query=<WAPI>
      <TENANT>${tenantId}</TENANT>
      <USERNAME>${crmApiUsername}</USERNAME>
      <PASSWORD>${crmApiPassword}</PASSWORD>
      <COMMAND OBJECT="Customer" ACTION="GET">
        ${filterXml}
      </COMMAND>
    </WAPI>`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return mapFetchCustomersXmlResponseToJson(response.data);
};

export default fetchCustomersData;
