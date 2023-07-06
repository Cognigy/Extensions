# Zendesk Sell

Integrates Cognigy.AI with the Zendesk Sell CRM System (https://www.zendesk.de/sell/)

## Connection

**Zendesk Sell OAuth2 Access Token**:

- **accessToken**
  - The OAuth2 App Access Token
    - Technical Docs:
      - https://developer.zendesk.com/api-reference/sales-crm/authentication/requests/#accessing-protected-resources
      - https://developer.zendesk.com/api-reference/sales-crm/authentication/introduction/

## Flow Nodes

All exposed Flow Nodes of this Extension follow the [Zendesk Sales CRM API](https://developer.zendesk.com/api-reference/sales-crm/introduction/) whereby the respective result returns `response.data` if there is a list of results.

### Exposed Nodes

- [Search Contacts](https://developer.zendesk.com/api-reference/sales-crm/search/introduction/)
- [Get Contact Details](https://developer.zendesk.com/api-reference/sales-crm/resources/contacts/#retrieve-a-single-contact)