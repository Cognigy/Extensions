# Freshdesk

This Extension can be used for managing tickets in [Freshdesk](https://freshdesk.com/). As source of the exposed Flow Nodes, the [Freshdesk API](https://developers.freshdesk.com/api/#tickets) is used.

## Connection

In order to authenticate the virtual agent to establish a connection with Freshdesk, the **subdomain** and **API KEY** must be provided:

- API Key
  - [How to find your API Key](https://support.freshdesk.com/en/support/solutions/articles/215517)
- Subdomain
  - The value can be found in the URL of the Freshdesk instance, e.g. https:// `company` .freshdesk.com

## Node: Create Ticket

This Flow Node creates a new ticket in Freshdesk with:
- Subject
- Description
- Email
- Status
- Source
- Priority

As a response, the new ticket is stored in the [Input](https://docs.cognigy.com/ai/tools/interaction-panel/input/) or [Context](https://docs.cognigy.com/ai/tools/interaction-panel/context/) object.

## Node: Get Ticket

This Flow Node retrieves an existing ticket by a given **Ticket ID**. The response, namely the ticket, is stored in the [Input](https://docs.cognigy.com/ai/tools/interaction-panel/input/) or [Context](https://docs.cognigy.com/ai/tools/interaction-panel/context/) object.