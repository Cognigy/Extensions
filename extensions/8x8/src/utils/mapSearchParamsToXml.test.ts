import type { SearchGenericParams } from '../types';
import mapSearchParamsToXml from './mapSearchParamsToXml';

describe('customer node > mapSearchParamsToXml', () => {
  const trimText = (text: string): string => text.replace(/\s/g, '').trim();
  it('should map search params for get customer to xml', () => {
    const searchParams = {
      filter$customFields: {
        customField1: 'value1',
        customField2: 'value2'
      },
      filter$firstName: 'John',
      filter$lastName: 'Doe',
      filter$email: 'r@8x8.com',
      filter$voice: '123456789',
      filter$company: '8x8',
      filter$customerType: 'customerType',
      filter$accountNum: '123456789'
    };
    const searchXml = mapSearchParamsToXml(searchParams);

    expect(searchXml).toEqual(trimText(`
      <CUSTOMFIELD1>value1</CUSTOMFIELD1>
      <CUSTOMFIELD2>value2</CUSTOMFIELD2>
      <FIRSTNAME>John</FIRSTNAME>
      <LASTNAME>Doe</LASTNAME>
      <EMAIL>r@8x8.com</EMAIL>
      <VOICE>123456789</VOICE>
      <COMPANY>8x8</COMPANY>
      <CUSTOMERTYPE>customerType</CUSTOMERTYPE>
      <ACCOUNTNUM>123456789</ACCOUNTNUM>
      `)
    );
  });

  it('should map search params for get case to xml', () => {
    const searchParams = {
      filter$customFields: {
        customField3: 'value1',
        customField4: 'value2'
      },
      filter$caseNum: '1231231',
      filter$accountNum: '1231231',
      filter$lastName: 'Doe',
      filter$company: 'Company1',
      filter$status: 'Open',
      filter$project: 'Project1',
      filter$subject: 'subject1'
    };
    const searchXml = mapSearchParamsToXml(searchParams);

    expect(searchXml).toEqual(trimText(`
      <CUSTOMFIELD3>value1</CUSTOMFIELD3>
      <CUSTOMFIELD4>value2</CUSTOMFIELD4>
      <CASENUM>1231231</CASENUM>
      <ACCOUNTNUM>1231231</ACCOUNTNUM>
      <LASTNAME>Doe</LASTNAME>
      <COMPANY>Company1</COMPANY>
      <STATUS>Open</STATUS>
      <PROJECT>Project1</PROJECT>
      <SUBJECT>subject1</SUBJECT>
      `)
    );
  });

  it('should ignore empty string', () => {
    const searchParams = {
      filter$customFields: {
        customField1: '',
        customField2: 'value2'
      },
      filter$firstName: 'John',
      filter$lastName: '',
      filter$email: 'r@8x8.com',
      filter$voice: '',
      filter$company: '8x8'
    };
    const searchXml = mapSearchParamsToXml(searchParams);

    expect(searchXml).toEqual(trimText(`
      <CUSTOMFIELD2>value2</CUSTOMFIELD2>
      <FIRSTNAME>John</FIRSTNAME>
      <EMAIL>r@8x8.com</EMAIL>
      <COMPANY>8x8</COMPANY>
      `)
    );
  });

  it('should map search params to xml with null custom fields', () => {
    const searchParams = {
      filter$customFields: null,
      filter$firstName: 'John'
    } as unknown as SearchGenericParams;
    const searchXml = mapSearchParamsToXml(searchParams);
    expect(searchXml).toEqual(trimText(`
      <FIRSTNAME>John</FIRSTNAME>
      `));
  });

  it('should map search params to xml with out custom fields', () => {
    const searchParams = {
      filter$firstName: 'John'
    };
    const searchXml = mapSearchParamsToXml(searchParams);
    expect(searchXml).toEqual(trimText(`
      <FIRSTNAME>John</FIRSTNAME>
    `));
  });

  it('should map search params to xml with out filter prefix', () => {
    const searchParams = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'r@8x8.com'
    } as unknown as SearchGenericParams;
    const searchXml = mapSearchParamsToXml(searchParams);
    expect(searchXml).toEqual('');
  });
});
