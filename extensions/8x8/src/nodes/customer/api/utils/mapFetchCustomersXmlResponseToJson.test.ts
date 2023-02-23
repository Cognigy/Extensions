import getMockCustomerJson from '../../__mocks__/getMockCustomerJson';
import getMockCustomerXml from '../../__mocks__/getMockCustomerXml';
import mapFetchCustomersXmlResponseToJson from './mapFetchCustomersXmlResponseToJson';

describe(' customer > utils > mapCustomerXmlResponseToJson()', () => {
  it('should return empty array when the xml don\'t have customer details', () => {
    const mockXMLData = `<?xml version="1.0" encoding="ISO-8859-1"?>
    <WAPI>
      <REPLY STATUS="0" ERROR_STR="" ERROR_CODE="0">
        <data />
      </REPLY>
    </WAPI>`;
    expect(mapFetchCustomersXmlResponseToJson(mockXMLData)).toEqual([]);
  });

  it('should map customers data to json when find with success', () => {
    const mockXMLData = `<?xml version="1.0" encoding="ISO-8859-1"?>
    <WAPI>
        <REPLY STATUS="0" ERROR_STR="" ERROR_CODE="0">
    ${getMockCustomerXml()}
    ${getMockCustomerXml()}
        </REPLY>
    </WAPI>`;
    const data = mapFetchCustomersXmlResponseToJson(mockXMLData);
    expect(data).toEqual([getMockCustomerJson(), getMockCustomerJson()]);
  });

  it('should one customer data to json when find with success', () => {
    const mockXMLData = `<?xml version="1.0" encoding="ISO-8859-1"?>
    <WAPI>
        <REPLY STATUS="0" ERROR_STR="" ERROR_CODE="0">
    ${getMockCustomerXml()}
        </REPLY>
    </WAPI>`;
    const data = mapFetchCustomersXmlResponseToJson(mockXMLData);
    expect(data).toEqual([getMockCustomerJson()]);
  });

  it('should throw error when response contains an error', () => {
    const errorMessage = 'The value test of the tag firstname is not valid.';
    const mockXMLData = `<?xml version="1.0" encoding="ISO-8859-1"?>
    <WAPI>
        <REPLY STATUS="-1" ERROR_STR="${errorMessage}" ERROR_CODE="5"/>
    </WAPI>`;
    expect(() => mapFetchCustomersXmlResponseToJson(mockXMLData)).toThrow(new Error(errorMessage));
  });
});
