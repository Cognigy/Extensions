import type { CustomerData } from '../../types';
import getParsedXMLItems from '../../../../utils/getParsedXMLItems';

const mapCustomerXmlResponseToJson = (customerData: Record<string, string>): CustomerData => ({
  firstName: customerData.FIRSTNAME,
  lastName: customerData.LASTNAME,
  company: customerData.COMPANY,
  pbx: customerData.PBX,
  comments: customerData.COMMENTS,
  accountNumber: customerData.ACCOUNTNUM as unknown as number,
  customerType: customerData.customertype,
  email: customerData.EMAIL,
  voice: customerData.VOICE,
  alternative: customerData.ALTERNATIVE,
  fax: customerData.FAX,
  address1: {
    street1: customerData.ADDR1STR1,
    street2: customerData.ADDR1STR2,
    city: customerData.ADDR1CITY,
    state: customerData.ADDR1STATE,
    zip: customerData.ADDR1ZIP,
    country: customerData.ADDR1COUNTRY
  },
  address2: {
    street1: customerData.ADDR2STR1,
    street2: customerData.ADDR2STR2,
    city: customerData.ADDR2CITY,
    state: customerData.ADDR2STATE,
    zip: customerData.ADDR2ZIP,
    country: customerData.ADDR2COUNTRY
  }
});

const mapFetchCustomersXmlResponseToJson = (xmlData: string): CustomerData[] => getParsedXMLItems<CustomerData>(xmlData, mapCustomerXmlResponseToJson);

export default mapFetchCustomersXmlResponseToJson;
