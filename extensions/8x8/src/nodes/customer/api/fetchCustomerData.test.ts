import axios from 'axios';
import getMockCustomerJson from '../__mocks__/getMockCustomerJson';
import getMockCustomerXml from '../__mocks__/getMockCustomerXml';
import type { FetchCustomerDataParams } from './fetchCustomerData';
import fetchCustomersData from './fetchCustomerData';

jest.mock('axios', () => jest.fn());
const mockAxios = axios as unknown as jest.Mock;

describe('customer > api > fetchCustomerData()', () => {
  const getMockParams = (): FetchCustomerDataParams => ({
    filterXml: '<EMAIL>vlad.puscas@8x8.com</EMAIL>',
    apiKey: 'sdfakjn43kjertnkjb9743tqiuheg43tq98',
    tenantId: 'test-tenant',
    clusterBaseUrl: 'https://8x8.com'
  });

  it('should fetch and convert xml to json', async() => {
    mockAxios.mockReturnValueOnce({
      data: `<?xml version="1.0" encoding="ISO-8859-1"?>
    <WAPI>
      <REPLY STATUS="0" ERROR_STR="" ERROR_CODE="0">
      ${getMockCustomerXml()}
      </REPLY>
    </WAPI>`
    });
    const data = await fetchCustomersData(getMockParams());

    expect(data).toEqual([getMockCustomerJson()]);
  });
});
