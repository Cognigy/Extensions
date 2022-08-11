# 8x8

This Extension integrates with the 8x8 Agent Desktop and CRM system.

## Connections

**8x8 OAuth:**

This Connection is required to use the "Handover to Agent" Flow Node that starts a Live Chat conversation in the 8x8 Agent Desktop.
- username
- password
- tenant
- region

**8x8 CRM**

This Connection is required to use the "Get Customer" Flow Node that retrieves user information from the CRM based on a given email address.
- username
- password
- tenant

## Node: Handover To Agent

- [API Documentation](https://developer.8x8.com/contactcenter/reference/createcctransaction)

This Flow Node sends a Live Chat request to all online human agents that are logged in to the 8x8 Agent Desktop. Furthermore, it will send the Chat Transcript and Customer information.

## Node: Get Customer

This Flow Node retrieves Customer information from the 8x8 CRM system based on a given email address. The result is stored in the Input or Context object and looks similar to this example:

```json
{
  "customer": [
    {
      "FIRSTNAME": [
        "Laura"
      ],
      "LASTNAME": [
        "Wilson"
      ],
      "COMPANY": [
        "Cognigy"
      ],
      "PBX": [
        ""
      ],
      "COMMENTS": [
        ""
      ],
      "ACCOUNTNUM": [
        "10000000"
      ],
      "customertype": [
        "Default"
      ],
      "EMAIL": [
        "l.wilson@cognigy.com"
      ],
      "VOICE": [
        "+123456789"
      ],
      "ALTERNATIVE": [
        ""
      ],
      "FAX": [
        ""
      ],
      "ADDR1STR1": [
        ""
      ],
      "ADDR1STR2": [
        ""
      ],
      "ADDR1CITY": [
        ""
      ],
      "ADDR1STATE": [
        ""
      ],
      "ADDR1ZIP": [
        ""
      ],
      "ADDR1COUNTRY": [
        ""
      ],
      "ADDR2STR1": [
        ""
      ],
      "ADDR2STR2": [
        ""
      ],
      "ADDR2CITY": [
        ""
      ],
      "ADDR2STATE": [
        ""
      ],
      "ADDR2ZIP": [
        ""
      ],
      "ADDR2COUNTRY": [
        ""
      ]
    }
  ]
}
```