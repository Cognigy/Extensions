import getParsedXMLItems, { errorMessageInvalidResponse } from './getParsedXMLItems';

describe('utils > getParsedXMLItems', () => {
  const mockMapFunc = (data: Record<string, string>): Record<string, string> => data;

  it('should return properly parsed item', () => {
    const mockXMLData = `<?xml version="1.0" encoding="ISO-8859-1"?>
    <WAPI>
      <REPLY STATUS="0" ERROR_STR="" ERROR_CODE="0">
        <ITEM>
          <FIELD1>value1</FIELD1>
          <FIELD2>value2</FIELD2>
        </ITEM>
      </REPLY>
    </WAPI>`;
    expect(getParsedXMLItems(mockXMLData, mockMapFunc)).toStrictEqual([{
      FIELD1: 'value1',
      FIELD2: 'value2'
    }]);
  });

  it('should return properly parsed multiple items', () => {
    const mockXMLData = `<?xml version="1.0" encoding="ISO-8859-1"?>
    <WAPI>
      <REPLY STATUS="0" ERROR_STR="" ERROR_CODE="0">
        <ITEM>
          <FIELD1>value1</FIELD1>
          <FIELD2>value2</FIELD2>
        </ITEM>
        <ITEM>
          <FIELD3>value3</FIELD3>
          <FIELD4>value4</FIELD4>
        </ITEM>
      </REPLY>
    </WAPI>`;
    expect(getParsedXMLItems(mockXMLData, mockMapFunc)).toStrictEqual([{
      FIELD1: 'value1',
      FIELD2: 'value2'
    }, {
      FIELD3: 'value3',
      FIELD4: 'value4'
    }]);
  });

  it('should return empty array when the xml doesn\'t have any tags', () => {
    const mockXMLData = `<?xml version="1.0" encoding="ISO-8859-1"?>
    <WAPI>
      <REPLY STATUS="0" ERROR_STR="" ERROR_CODE="0">
      </REPLY>
    </WAPI>`;
    expect(getParsedXMLItems(mockXMLData, mockMapFunc)).toEqual([]);
  });

  it('should throw error when the xml is invalid', () => {
    const errorMessage = 'Invalid \'[    "WAPI",    "REPLY"]\' found.:1:1';
    const mockXMLData = '<WAPI><REPLY';
    expect(() => getParsedXMLItems(mockXMLData, mockMapFunc)).toThrow(new Error(errorMessage));
  });

  it('should throw error when the xml don\'t follow structure', () => {
    const mockXMLData = '<?xml version="1.0" encoding="ISO-8859-1"?><mock></mock>';
    expect(() => getParsedXMLItems(mockXMLData, mockMapFunc)).toThrow(new Error(errorMessageInvalidResponse));
  });

  it('should throw error when the WAPI is empty', () => {
    const mockXMLData = '<?xml version="1.0" encoding="ISO-8859-1"?><WAPI></WAPI>';
    expect(() => getParsedXMLItems(mockXMLData, mockMapFunc)).toThrow(new Error(errorMessageInvalidResponse));
  });

  it('should throw error when the REPLY don\'t have attributes', () => {
    const mockXMLData = '<?xml version="1.0" encoding="ISO-8859-1"?><WAPI><REPLY>test</REPLY></WAPI>';
    expect(() => getParsedXMLItems(mockXMLData, mockMapFunc)).toThrow(new Error(errorMessageInvalidResponse));
  });

  it('should throw error when the REPLY don\'t have ERROR_STR attribute', () => {
    const errorMessage = 'No error message found';
    const mockXMLData = '<?xml version="1.0" encoding="ISO-8859-1"?><WAPI><REPLY STATUS="-1">test</REPLY></WAPI>';
    expect(() => getParsedXMLItems(mockXMLData, mockMapFunc)).toThrow(new Error(errorMessage));
  });
});
