# Salesforce CRM

Integrates Cognigy.AI with Salesforce CRM (https://www.salesforce.com)

This Extension is based on jsforce (https://jsforce.github.io/)

### Connection

- username
- password
    - Maybe one need to add the **Security Token** to the password
- loginUrl
    - Salesforce login url, e.g. 'https://test.salesforce.com' or https://login.salesforce.com for production


## Node: Log In

This Node can be used with user-supplied Username and Password in order to **login** and **identify** the user as a Salesforce platform user. For this function, the *username*, *password*, and *login Url* are required.

Note: This Node does **_not_** need to run before other Nodes listed below. It is primarily to verify runtime-supplied Salesforce credentials and return information about the owner of those credentials from Salesforce. Since the the credentials need to be obtained and used in a Flow, security should be considered, such as 'Blind' mode, and this Node may only be applicable to secure, internal use cases.

After signing in the Salesforce user, the following information will be stored to the input or context object:

```json
{
"salesforce": {
    "login": {
      "id": "...",
      "organizationId": "...",
      "url": "https://login.salesforce.com/id/..."
    },
    "user": {
      "id": "https://login.salesforce.com/id/...",
      "asserted_user": true,
      "user_id": "...",
      "organization_id": "...",
      "username": "a.teusz@cognigy.com",
      "nick_name": "a.teusz",
      "display_name": "Alexander Teusz",
      "email": "a.teusz@cognigy.com",
      "email_verified": true,
      "first_name": "Alexander",
      "last_name": "Teusz",
      "timezone": "Europe/Berlin",
      "photos": {
        "picture": "https://c.salesforce.content.force.com/profilephoto/005/F",
        "thumbnail": "https://c.salesforce.content.force.com/profilephoto/005/T"
      },
      "addr_street": "Speditionstraße 1",
      "addr_city": "Düsseldorf",
      "addr_state": "NRW",
      "addr_country": "DE",
      "addr_zip": "40221",
      "mobile_phone": "+49123456789",
      "mobile_phone_verified": true,
      "is_lightning_login_user": false,
      "status": {
        "created_date": null,
        "body": null
      },
      "urls": {},
      "active": true,
      "user_type": "STANDARD",
      "language": "en_US",
      "locale": "de_DE_EURO",
      "utcOffset": 3600000,
      "last_modified_date": "2021-03-05T15:55:20Z"
    }
  }
}
```


## Node: Create Entity

All **Salesforce API Fields** are listed in the following PDF File: 
[Salesforce API Fields](https://resources.docs.salesforce.com/206/latest/en-us/sfdc/pdf/salesforce_field_names_reference.pdf)

### API Version Number
Some Salesforce fields can only be modified when the API version is defined. You can find these settings by activating **Specify Salesforce API Version**.

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

## Node: Retrieve Entity

Retrieves the entity by searching for the given ID.

```json
{
 "sf_retrieve": {
     "attributes": {
       "type": "Account",
       "url": "/services/data/v42.0/sobjects/Account/0011t00000FIlUTAA1"
     },
     "Id": "0011t00000FIlUTAA1",
     "IsDeleted": false,
     "MasterRecordId": null,
     "Name": "My Account #1",
     "Type": null,
     "ParentId": null,
     "BillingStreet": null,
     "BillingCity": null,
     "BillingState": null,
     "BillingPostalCode": null,
     "BillingCountry": null
}

```

## Node: Delete Entity

Deletes an entity by ID. Specify the type of **entity**, such as **Contact**. The response looks like the following: 

```json
    "id": "0031t00000D508kAAB",
    "success": true,
    "errors": []
```

## Node: Update Entity

Updates an entity by ID and JSON arguments. The following code shows an example for updating a **Contact**:

```json
{
    "FirstName": "Peter", 
    "LastName": "Parker"
}
```

The response looks like the following: 

```json
    "id": "0031t00000D508kAAB",
    "success": true,
    "errors": []
```

## Node: Query (SOQL)

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

## Node: Search (SOSL)

Carries out a ['Salesforce Object Search Language'](https://developer.salesforce.com/search#stq=SOSL%20Introduction) search, searching across fields, and potentially returning aggregate records based on multiple entities. The syntax deviates more from SQL.

Note that SOSL will search across a maximum of 2000 records, being an inherent limit of the Salesforce search facility. By more carefully targeting your search queries, you are less likely to be impacted by this limit.

The response returned into the input or context key will be like:
```json
// By default, in 'input.salesforce.search':
"searchRecords": [
  {
    "attributes": {
      "type": "Contact",
      "url": "/services/data/v42.0/sobjects/Contact/0035g000003j5feAAA"
    },
    "Id": "0035g000003j5feAAA",
    "FirstName": "Jane",
    "LastName": "Grey"
  },
  {
    "attributes": {
      "type": "Contact",
      "url": "/services/data/v42.0/sobjects/Contact/0035g000003j5fZAAQ"
    },
    "Id": "0035g000003j5fZAAQ",
    "FirstName": "John",
    "LastName": "Bond"
  }
]

```

