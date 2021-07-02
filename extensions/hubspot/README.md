Integrates Cognigy.AI with Hubspot CRM (https://www.hubspot.com)

This extension is based on node-hubspot (https://www.npmjs.com/package/hubspot)

### Connection
This extension needs a Connection to be defined and passed to the Nodes. The Connection must have the following keys:

- key: apiKey
- value: Your Hubspot API KEY

**Properties**

The Hubspot API offers to include specific properties. Such as the [documentation](https://developers.hubspot.com/docs/overview) says, you can add the properties as a list or a simple string: 

- firstname
- firstname,lastname,...

If you just type **properties** into the properties field, the API will return all properties of the object.

# Node: findContactByEmail

[Source](https://developers.hubspot.com/docs/methods/contacts/get_contact_by_email)

You need the **Email** address. Optional, you can use **Properties** for more information. Then it returns the following information: 

```json
"contact": {
    "vid": 123445,
    "canonical-vid": 123445,
    "merged-vids": [],
    "portal-id": 27123836,
    "is-contact": true,
    "profile-token": "AO...",
    "profile-url": "https://app.hubspot.com/contacts/2761836/contact/123445",
    "properties": {
      "firstname": {
        "value": "Max"
      }
    },
  }
```

# Node: updateContact & updateCompany

[Contact](https://developers.hubspot.com/docs/methods/contacts/update_contact)
[Company](https://developers.hubspot.com/docs/methods/companies/update_company)

Updates a existing **Contact** or a **Company** in Hubspot. You need the **Hubspot Contact ID** (Vid) and the **Data** to update (example for Contact: 

```json
{
  "properties": [
    {
      "property": "firstname",
      "value": {
        "$cs": {
          "script": "cc.newContact.contact_firstname.value",
          "type": "string"
        }
      }
    }
  ]
}
```

To update a company, you have to use a little different JSON: 

```json
{
  "properties": [
    {
      "name": "name",
      "value": "New Company Name"
    }
  ]
}
```

# Node: createContact & createCompany

[Contact](https://developers.hubspot.com/docs/methods/contacts/create_contact)
[Company](https://developers.hubspot.com/docs/methods/companies/create_company)

Creating a **Contact** or a **Company** is nearly the same. You need the following JSON to the **Data** field (example for Contact): 

```json
{
  "properties": [
    {
      "property": "firstname",
      "value": "CM TEST"
    }
  ]
}
```

If the creation was successful, the API  returns the new Contact in a JSON format. 

# Node: findContact

You can include a **query** to search in your **Contacts**, such as the full name. Then it returns the **Contact ID (Vid)** of the found contact:

```json
"contact": {
    "query": "Max Mustermann",
    "offset": 1,
    "has-more": false,
    "total": 1,
    "contacts": [
      {
        "vid": 3243251
      }
    ]
  }
```