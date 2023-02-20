import axios from 'axios';
import getMockCaseXml from '../__mocks__/getMockCaseXml';
import getMockCaseJson from '../__mocks__/getMockCaseJson';
import type { FetchCaseDataParams } from './fetchCaseData';
import fetchCaseData from './fetchCaseData';

jest.mock('axios', () => jest.fn());
const mockAxios = axios as unknown as jest.Mock;

describe('case > api > fetchCustomerData()', () => {
  const getMockParams = (): FetchCaseDataParams => ({
    filterXml: '<CASENUM>123123123</CASENUM>',
    crmApiPassword: 'test-pass',
    tenantId: 'test-tenant',
    clusterBaseUrl: 'https://8x8.com',
    crmApiUsername: 'user'
  });

  it('should fetch and convert xml to json', async() => {
    mockAxios.mockReturnValueOnce({
      data: `<?xml version="1.0" encoding="ISO-8859-1"?>
    <WAPI>
      <REPLY STATUS="0" ERROR_STR="" ERROR_CODE="0">
      ${getMockCaseXml()}
      </REPLY>
    </WAPI>`
    });
    const data = await fetchCaseData(getMockParams());

    expect(data).toEqual([getMockCaseJson()]);
  });
});
