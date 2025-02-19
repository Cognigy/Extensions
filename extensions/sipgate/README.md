Integrates Cognigy.AI with sipgate (https://www.sipgate.de)

This Extension is based on the sipgate.io API (https://api.sipgate.com/v2/doc)

### Connection
This Extension needs a Connection to be defined and passed to the Nodes. The Connection must have the following keys:

- Token ID
  - key: **personalAccessTokenId**
  - value: The Token ID
- Token 
  - key: **personalAccessToken**
  - value: The Token

# Node: sendSMS

[sipgate Docs on sending SMS](https://api.sipgate.com/v2/doc#/sessions/sendWebSms)

You need the `recipient` and the SMS `message`.

To send SMS messages via the sipgate API using a Personal Access Token (PAT), your token must have the appropriate permissions, defined by scopes. For sending SMS, the required scope is:

`sessions:sms:write`: This scope allows your application to initiate and send SMS messages.
When creating or managing your PAT, ensure that this scope is selected to grant the necessary permissions for SMS functionality. For detailed instructions on setting up and using Personal Access Tokens, refer to sipgate's official documentation.
