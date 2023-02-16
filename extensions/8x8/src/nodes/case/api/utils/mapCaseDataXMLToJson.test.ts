import getMockCaseXml from '../../__mocks__/getMockCaseXml';
import getMockCaseJson from '../../__mocks__/getMockCaseJson';
import mapCaseDataXMLToJson from './mapCaseDataXMLToJson';

describe('case > utils > mapCaseDataXMLToJson', () => {
  it('should map case data to json', () => {
    const mockXML = `<?xml version="1.0" encoding="ISO-8859-1"?>
    <WAPI>
      <REPLY STATUS="0" ERROR_STR="" ERROR_CODE="0">
      ${getMockCaseXml()}
      </REPLY>
    </WAPI>`;
    expect(mapCaseDataXMLToJson(mockXML)).toStrictEqual([getMockCaseJson()]);
  });
});
