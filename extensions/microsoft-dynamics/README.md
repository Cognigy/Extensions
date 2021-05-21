# Microsoft Dynamics 365

With this Extension, one can maintain Contacts and Accounts in Microsoft Dynamics365.

## Connection

In order to integrate with this system, **two** different Connections are required:

- Microsoft Online
- Dynamics365

### Microsoft Online

Since Dynamics365 is included in the Microsoft 365 product, Cognigy has to authenticate itself before executing different Dynamics-related functions. Therefore, the following credentials need to be provided:

- Client ID
- Client Secret
- Scope
- Tenant ID

#### Node: Get Access Token

The credentials listed above need to be used in order to execute the **Get Access Token** Flow Node. Afterward, the following result will be stored in the context:

```json
{
    "microsoft": {
        "auth": {
            "token_type": "Bearer",
            "expires_in": 3599,
            "ext_expires_in": 3599,
            "access_token": "..."
        }
    }
}
```

The **access token** will be used for further Flow Nodes in this Extension. Therefore, it can be extracted via CognigyScript:

- `{{context.microsoft.auth.access_token}}`

### Dynamics365

- Organization URI

In this Connection, the URI (Uniform Resource Identifier) of the used Microsoft Dynamics 365 organization needs be provided as it will be used in order to access the right instance and data.

---


### Node: Search Entity

With this Flow Node, Contact and Account entites can be searched via different **filters** and **search values**. For instance, one could search a contact based on the first name, such as displayed below:

**Example (Contact):**

- Return Values: contactid,firstname,lastname
- Search Filter: firstname
- Value: Laura


```json
{
    "dynamics": {
        "search": {
            "@odata.context": "https://company.crm.dynamics.com/api/data/v9.2/$metadata#contacts(contactid,firstname,lastname)",
            "value": [
                {
                    "@odata.etag": "W/\"4290\"",
                    "contactid": "08b6ffb9-3bb9-eb11-8236-000d3add0663",
                    "firstname": "Laura",
                    "lastname": "Wilson"
                }
            ]
        }
    }
}
```

The result can be extracted with CognigyScript as well and used in a Say Node -- for example:

> "I found a contact called {{context.search.value[0].firstname}} {{context.search.value[0].lastname}} that could help you"

### Node: Create Entity

Next to retrieving entity information, it can be created in Dynamics as well. For instance, a new contact could be added to the system by asking for some related information.

**Example (Contact) Entity Data:**

```json
{
    "firstname": "{{context.firstname}}",
    "lastname": "{{context.lastname}}",
    "mobilephone": "{{context.phone}}",
    "emailaddress1": "{{context.email}}"
}
```

### Node: Retrieve Entity

If the **Entity Primary Key** is known already, this Flow Node, instead of **Search Entity** can be used in order to retrieve the whole data information.

**Example (Contact):**

```json
 "dynamics": {
    "entity": {
      "@odata.context": "https://company.crm.dynamics.com/api/data/v8.2/$metadata#contacts/$entity",
      "@odata.etag": "W/\"423\"",
      "customertypecode": 1,
      "mobilephone": "23456673231",
      "merged": false,
      "territorycode": 1,
      "emailaddress1": "l.wilson@company.com",
      "haschildrencode": 1,
      "exchangerate": 1,
      "preferredappointmenttimecode": 1,
      "msdyn_orgchangestatus": 0,
      "isbackofficecustomer": false,
      "modifiedon": "2021-05-18T06:33:30Z",
      "_owninguser_value": "2e10ed42-88b5-eb11-8236-000d3ab2003b",
      "lastname": "Wilson",
      "marketingonly": false,
      "donotphone": false,
      "preferredcontactmethodcode": 1,
      "educationcode": 1,
      "_ownerid_value": "2e10ed42-88b5-eb11-8236-000d3ab2003b",
      "customersizecode": 1,
      "firstname": "Laura",
      "donotpostalmail": false,
      "yomifullname": "Laura Wilson",
      "address2_addresstypecode": 1,
      "donotemail": false,
      "address2_shippingmethodcode": 1,
      "fullname": "Laura Wilson",
      "address1_addressid": "743780fb-0b39-4bcd-aa66-c25d624d1d3b",
      "msdyn_gdproptout": false,
      "address2_freighttermscode": 1,
      "statuscode": 1,
      "createdon": "2021-05-18T06:33:30Z",
      "donotsendmm": false,
      "donotfax": false,
      "leadsourcecode": 1,
      "jobtitle": "CEO",
      "versionnumber": 4233489,
      "followemail": true,
      "creditonhold": false,
      "telephone1": "123465422",
      "_transactioncurrencyid_value": "ad119612-8cb5-eb11-8236-000d3ab20878",
      "address3_addressid": "652d9bef-d1da-40f0-885f-6803b0010d6a",
      "donotbulkemail": false,
      "_modifiedby_value": "2e10ed42-88b5-eb11-8236-000d3ab2003b",
      "_createdby_value": "2e10ed42-88b5-eb11-8236-000d3ab2003b",
      "donotbulkpostalmail": false,
      "_parentcustomerid_value": "a16b3f4b-1be7-e611-8101-e0071b6af231",
      "contactid": "a58e0cf5-a2b7-eb11-8236-000d3add0663",
      "participatesinworkflow": false,
      "statecode": 0,
      "_owningbusinessunit_value": "bcd70447-44b5-eb11-8236-000d3ab2003b",
      "address2_addressid": "2e608c27-975c-4079-91e5-ce89cf211e35",
      "shippingmethodcode": 1,
      "telephone3": null,
      "address1_shippingmethodcode": null,
      "familystatuscode": null,
      "_defaultpricelevelid_value": null,
      "_preferredequipmentid_value": null,
      "nickname": null,
      "address1_freighttermscode": null,
      "address3_upszone": null,
      "annualincome_base": null,
      "anniversary": null,
      "address1_upszone": null,
      "websiteurl": null,
      "address2_city": null,
      "_slainvokedid_value": null,
      "address1_postofficebox": null,
      "importsequencenumber": null,
      "address3_longitude": null,
      "preferredappointmentdaycode": null,
      "utcconversiontimezonecode": null,
      "overriddencreatedon": null,
      "aging90": null,
      "stageid": null,
      "address3_primarycontactname": null,
      "address1_utcoffset": null,
      "address1_latitude": null,
      "home2": null,
      "yomifirstname": null,
      "_masterid_value": null,
      "address3_shippingmethodcode": null,
      "lastonholdtime": null,
      "address3_stateorprovince": null,
      "address2_fax": null,
      "address3_telephone3": null,
      "address3_telephone2": null,
      "address3_telephone1": null,
      "governmentid": null,
      "address2_line1": null,
      "address1_telephone3": null,
      "address1_telephone2": null,
      "address1_telephone1": null,
      "address2_postofficebox": null,
      "ftpsiteurl": null,
      "emailaddress2": null,
      "address2_latitude": null,
      "processid": null,
      "emailaddress3": null,
      "address2_composite": null,
      "traversedpath": null,
      "address1_city": null,
      "spousesname": null,
      "address3_name": null,
      "address3_postofficebox": null,
      "address2_line2": null,
      "aging30_base": null,
      "address1_addresstypecode": null,
      "managerphone": null,
      "address2_stateorprovince": null,
      "address2_postalcode": null,
      "entityimage_url": null,
      "address1_composite": null,
      "aging60": null,
      "managername": null,
      "address3_postalcode": null,
      "timezoneruleversionnumber": null,
      "address3_utcoffset": null,
      "address2_telephone3": null,
      "address2_telephone2": null,
      "address2_telephone1": null,
      "numberofchildren": null,
      "address1_postalcode": null,
      "address2_upszone": null,
      "_owningteam_value": null,
      "address2_line3": null,
      "timespentbymeonemailandmeetings": null,
      "department": null,
      "address1_country": null,
      "address2_longitude": null,
      "suffix": null,
      "_modifiedonbehalfby_value": null,
      "creditlimit": null,
      "address1_line2": null,
      "paymenttermscode": null,
      "address1_county": null,
      "_preferredsystemuserid_value": null,
      "accountrolecode": null,
      "assistantname": null,
      "address1_fax": null,
      "_createdonbehalfby_value": null,
      "annualincome": null,
      "_accountid_value": null,
      "address2_name": null,
      "creditlimit_base": null,
      "business2": null,
      "_modifiedbyexternalparty_value": null,
      "address2_utcoffset": null,
      "address3_composite": null,
      "_originatingleadid_value": null,
      "_preferredserviceid_value": null,
      "_slaid_value": null,
      "fax": null,
      "address1_line1": null,
      "childrensnames": null,
      "address2_county": null,
      "address3_city": null,
      "aging30": null,
      "externaluseridentifier": null,
      "address1_line3": null,
      "_parentcontactid_value": null,
      "assistantphone": null,
      "address1_stateorprovince": null,
      "birthdate": null,
      "address3_addresstypecode": null,
      "onholdtime": null,
      "_createdbyexternalparty_value": null,
      "entityimage_timestamp": null,
      "address3_county": null,
      "employeeid": null,
      "subscriptionid": null,
      "entityimageid": null,
      "company": null,
      "gendercode": null,
      "callback": null,
      "lastusedincampaign": null,
      "address3_line3": null,
      "telephone2": null,
      "address3_freighttermscode": null,
      "yomilastname": null,
      "address3_fax": null,
      "description": null,
      "address3_line1": null,
      "address3_line2": null,
      "yomimiddlename": null,
      "aging90_base": null,
      "address1_name": null,
      "address1_primarycontactname": null,
      "address1_longitude": null,
      "middlename": null,
      "address2_primarycontactname": null,
      "entityimage": null,
      "address3_latitude": null,
      "salutation": null,
      "aging60_base": null,
      "pager": null,
      "address2_country": null,
      "address3_country": null
    }
  }
```