# Salesforce

Integrates Cognigy.AI with Salesforce (https://www.salesforce.com)

This Extension is based on jsforce (https://jsforce.github.io/)

> **WARNING** This is Extension is a replacement for the deprecated "Salesforce CRM" Extension. As this new Extension uses both, Basic and OAuth2 authentication, the old Connections cannot be used anymore. Updating to this new "Salesforce" Extension results in migrating from the old one. If you still want to upload and use the depcrecated "Salesforce CRM" Extension, please find the latest release here: https://github.com/Cognigy/Extensions/releases/tag/salesforce-crm423

### Connections

**OAuth2**

- consumerKey
- consumerSecret
- instanceUrl
  - Salesforce instance URL, such as https://cognigy.my.salesforce.com

Please read the following official Salesforce guide in order to create a "Connected App" that provides the Consumer key and Consumer secret that are used as client Id and client Secret in this type of authentication: https://help.salesforce.com/s/articleView?id=sf.connected_app_client_credentials_setup.htm&type=5
