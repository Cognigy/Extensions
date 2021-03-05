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

If Salesforce should be used in an internal use-case, one could use this node in order to **login** and **identify** a user for further use. For this function, the *username*, *password*, and *login Url* are required. After signing in the user, the following information will be stored to the input or context object:

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