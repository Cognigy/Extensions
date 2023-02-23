const getMockCaseXml = (): string => `
<ITEM>
    <ACCOUNTNUM>123456</ACCOUNTNUM>
    <CASENUM>67890</CASENUM>
    <SUBJECT>My printer doesn’t work</SUBJECT>
    <DESCRIPTION>This customer downloaded the new driver XXXX v5.4 of the driver, installed it and since then the printer doesn’t work.</DESCRIPTION>
    <STATUS>Open</STATUS>
    <PRIORITY>High</PRIORITY>
    <SEVERITY>Information</SEVERITY>
    <CATEGORY>Default</CATEGORY>
    <PROJECT>Default</PROJECT>
    <VISIBILITY>Private</VISIBILITY>
    <MEDIATYPE>Phone</MEDIATYPE>
    <ASSIGNEDTO>jsmith</ASSIGNEDTO>
    <ASSIGNEDDATE>01122010</ASSIGNEDDATE>
    <CREATEDBY>bpower</CREATEDBY>
    <CREATEDDATE>02152000</CREATEDDATE>
    <CLOSEDBY/>
    <CLOSEDDATE/>
    <LASTACTDATE>01232000</LASTACTDATE>
    <CF01_PICKLIST.NAME>value1</CF01_PICKLIST.NAME>
    <CF02.NAME>value2</CF02.NAME>
</ITEM>
`;

export default getMockCaseXml;
