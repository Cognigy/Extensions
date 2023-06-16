# Freshsales

This Extension can be used for managing tickets in [Freshsales](https://www.freshworks.com/de/crm/sales/). As source of the exposed Flow Nodes, the [Freshsales API](https://developers.freshworks.com/crm/api/#introduction) is used.

## Connection

In order to authenticate the virtual agent to establish a connection with Freshdesk, the **subdomain** and **API KEY** must be provided:

- API Key
  - [How to find your API Key](https://support.freshdesk.com/en/support/solutions/articles/215517)
- Subdomain
  - The value can be found in the URL of the Freshdesk instance, e.g. https:// `company` .freshdesk.com

## Node: Search

This Flow Node searches for Contacts, Accounts, Deals or Users in Freshsales.