# Salesforce

Integrates Cognigy.AI with Salesforce (https://www.salesforce.com)

This Extension is based on jsforce (https://jsforce.github.io/)

> **WARNING** This is Extension is a replacement for the deprecated "Salesforce CRM" Extension. As this new Extension uses both, Basic and OAuth2 authentication, the old Connections cannot be used anymore. Updating to this new "Salesforce" Extension results in migrating from the old one. If you still want to upload and use the depcrecated "Salesforce CRM" Extension, please find the latest release here: https://github.com/Cognigy/Extensions/releases/tag/salesforce-crm423

### Connections

**Baic Auth (DEPCRATED by Salesforce)**
   
- username
- password
    - Maybe one need to add the **Security Token** to the password
- loginUrl
    - Salesforce login url, e.g. 'https://test.salesforce.com' or https://login.salesforce.com for production

**OAuth2**

- consumerKey
- consumerSecret
- loginUrl
  - Salesforce domain, such as https://cognigy.my.salesforce.com

Please read the following official Salesforce guide in order to create a "Connected App" that provides the Consumer key and Consumer secret that are used as client Id and client Secret in this type of authentication: https://help.salesforce.com/s/articleView?id=sf.connected_app_client_credentials_setup.htm&type=5


---


## Node: Entity Reuqest

All **Salesforce API Fields** are listed in the following PDF File: 
[Salesforce API Fields](https://resources.docs.salesforce.com/206/latest/en-us/sfdc/pdf/salesforce_field_names_reference.pdf)

### API Version Number
Some Salesforce fields can only be modified when the API version is defined. You can find these settings by activating **Specify Salesforce API Version**.

Please find some examples for **creating** entities here:

### Entity: Event

Creates an **event** in the Salesforce calendar. The JSON in *record JSON* shows an example.

#### Record JSON

```json
{
  "Location": "Dusseldorf",
  "Description": "Eating Stones",
  "Subject": "Event X",
  "ActivityDate": "2019-01-25",
  "DurationInMinutes": "60",
  "ActivityDateTime": "2019-01-25T13:00:00"
}
```

### Entity: Contact

Creates a new **contact** in the **Contacts** Salesforce table. The JSON in *Record JSON* shows an example.

#### Record JSON

```json 
{
  "FirstName": "Max",
  "LastName": "Mustermann",
  "Phone": "0221 12345",
  "MobilePhone": "012345678912",
  "Email": "max.mustermann@mail.de",
  "Birthdate": "1994-10-14",
  "MailingCity": "Dusseldorf",
  "MailingStreet": "Speditionsstraße 1",
  "MailingState": "NRW",
  "MailingPostalCode": "40221",
  "MailingCountry": "Germany",
  "Description": "New Contact",
  "Department": "IT"
}
```

### Entity: Account

Creates a new **account** in the **Accounts** Salesforce table. The JSON in *Record JSON* shows an example.

#### Record JSON

```json
{
  "Name": "Company X",
  "Phone": "0221 12345",
  "BillingCity": "Dusseldorf",
  "BillingStreet": "Speditionsstraße 1",
  "BillingState": "NRW",
  "BillingPostalCode": "40221",
  "BillingCountry": "Germany",
  "Description": "New Contact",
  "Industry": "IT",
  "Website": "www.cognigy.com"
}
```

### Entity: Case

Creates a new **case** in the **Cases** Salesforce table. The JSON in *Case JSON* shows an example.

#### Case JSON

```json
{
    "Status": "New",
    "Origin": "Web",
    "Subject": "New Case",
    "Description": "This is a new case"
}
```

**IMPORTANT: The Description field is required and can not be empty!**


## Node: Query

Carries out a ['Salesforce Object Query Language'](https://developer.salesforce.com/search#stq=SOQL%20Introduction) query, against specific fields in a specific entity type, and returning entity records. The syntax is similar to SQL.

Note that the 'Maximum separate fetches' parameter, under Options, is not a direct limit on the number of records returned. Instead it limits the amount of data and the total time taken, by limiting the number of separate fetches carried out to obtain each chunk of results. It is suggested to experiment with this value to find a reasonable limit that does not take too long to complete, while still returning the records you require.

The response returned into the input or context key will be like:
```json
// By default SOQL query, in 'input.salesforce.query':
"totalSize": 22,
"done": true,
"records": [
  {
    "attributes": {
      "type": "Contact",
      "url": "/services/data/v42.0/sobjects/Contact/0035g000003j5fTAAQ"
    },
    "Id": "0035g000003j5fTAAQ",
    "Name": "Rose Gonzalez"
  },
  {
    "attributes": {
      "type": "Contact",
      "url": "/services/data/v42.0/sobjects/Contact/0035g000003j5fUAAQ"
    },
    "Id": "0035g000003j5fUAAQ",
    "Name": "Sean Forbes"
  },
  // ...
]
```
