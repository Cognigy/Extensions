import axios from 'axios';
import type { CaseData } from '../types';
import mapCaseDataXMLToJson from './utils/mapCaseDataXMLToJson';

export interface FetchCaseDataParams {
  apiKey: string
  tenantId: string
  clusterBaseUrl: string
  filterXml: string
}

const fetchCaseData = async({ filterXml, apiKey, tenantId, clusterBaseUrl }: FetchCaseDataParams): Promise<CaseData[]> => {
  const response = await axios({
    method: 'POST',
    url: `${clusterBaseUrl}/cc/v1/wapi`,
    data: ` <COMMAND OBJECT="Case" ACTION="GET">
        ${filterXml}
      </COMMAND>`,
    headers: {
      'Content-Type': 'application/xml',
      'X-8x8-Tenant': tenantId,
      'x-api-key': apiKey
    }
  });
  return mapCaseDataXMLToJson(response.data);
};

export default fetchCaseData;
