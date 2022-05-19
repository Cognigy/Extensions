# SAP C4C (Cloud for Customers)

With this Extension, a Cognigy.AI virtual agent can retrieve *customer*, *account*, or *contact* information from SAP.

- [SAP Cloud for Customers API Documentation](https://api.sap.com/api/customer/resource)

## Connection

In order to access the data as an authorized party, the

- Domain and
  - e.g. sandbox.api.sap.com
- API Key
  - 123123123123

must be provided within a [Connection](https://docs.cognigy.com/ai/resources/build/connections/). 

## Node: Get Contacts

This Flow Node retrieves a list of contacts from the Contacts Collection based on a given `filter`. This filter has to be in a valid OData format, such as `Email eq 'test@cognigy.com'`. Afterward, a list is returned and stored in the [Input](https://docs.cognigy.com/ai/tools/interaction-panel/input/) or [Context](https://docs.cognigy.com/ai/tools/interaction-panel/context/) based on the selected storage option:

```json
{
  "sap": {
    "contacts": [
      {
        "ObjectID": "00163E038C2E1EE299C1BB0BE93B6F9B",
        "ContactID": "1000476",
        "ContactUUID": "00163E03-8C2E-1EE2-99C1-BB0BE93B6F9B",
        "ExternalID": "",
        "ExternalSystem": "",
        "StatusCode": "4",
        "StatusCodeText": "Obsolete",
        "TitleCode": "",
        "TitleCodeText": "",
        "AcademicTitleCode": "",
        "AcademicTitleCodeText": "",
        "AdditionalAcademicTitleCode": "",
        "AdditionalAcademicTitleCodeText": "",
        "NamePrefixCode": "",
        "NamePrefixCodeText": "",
        "FirstName": "Peter",
        "LastName": "Gamoff",
        "AdditionalFamilyName": "",
        "Initials": "",
        "MiddleName": "",
        "Name": "Peter Gamoff",
        "GenderCode": "0",
        "GenderCodeText": "Gender not known",
        "MaritalStatusCode": "",
        "MaritalStatusCodeText": "",
        "LanguageCode": "",
        "LanguageCodeText": "",
        "NickName": "",
        "BirthDate": null,
        "BirthName": "",
        "ContactPermissionCode": "",
        "ContactPermissionCodeText": "",
        "ProfessionCode": "",
        "ProfessionCodeText": "",
        "...": "..."
      }
    ]
  }
}
```

## Node: Get Accounts

This Flow Node retrieves accounts based on a valid OData filter and stores it in the Input or Context of the virtual agent conversation.

## Node: Get (Individual) Customers

With this one, a list of customers can be retrieved based on a valid OData filter.