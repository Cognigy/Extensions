import axios from 'axios';
import type { CaseData } from '../types';
import mapCaseDataXMLToJson from './utils/mapCaseDataXMLToJson';

export interface FetchCaseDataParams {
  tenantId: string
  crmApiUsername: string
  crmApiPassword: string
  clusterBaseUrl: string
  filterXml: string
}

const fetchCaseData = async({ filterXml, crmApiPassword, tenantId, crmApiUsername, clusterBaseUrl }: FetchCaseDataParams): Promise<CaseData[]> => {
  const response = await axios({
    method: 'POST',
    url: `${clusterBaseUrl}/WAPI/wapi.php`,
    data: `xml_query=
    <WAPI>
      <TENANT>${tenantId}</TENANT>
      <USERNAME>${crmApiUsername}</USERNAME>
      <PASSWORD>${crmApiPassword}</PASSWORD>
      <COMMAND OBJECT="Case" ACTION="GET">
        ${filterXml}
      </COMMAND>
    </WAPI>`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return mapCaseDataXMLToJson(response.data);
};

export default fetchCaseData;
