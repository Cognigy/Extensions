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

## Node: Update Ticket

This Flow Nodes updates a ticket with a given **Ticket ID** using the available fields: https://developer.freshdesk.com/api/#update_ticket

## Node: Filter Tickets

This Flow Node returns all available tickets based on a given filter. Therefore, one could search for all tickets that are assigned or created by a specific person.

## Node: Reply to Ticket

This Flow Node replies to a Freshdesk ticket and, thus, sends the message to the actual user. Therefore, it answers emails through Freshdesk as well. In a potential scenario, the user is sending an email to the Freshdesk support inbox while this message is forwarded to Cognigy.AI via Freshdesk [Automations](https://support.freshdesk.com/en/support/solutions/articles/37614-setting-up-automation-rules-to-run-on-ticket-creation) and [Webhooks](https://support.freshdesk.com/en/support/solutions/articles/132589-using-webhooks-in-automation-rules-that-run-on-ticket-updates). Then, the Cognigy virtual agents creates the answer that fits the incoming support request and sends the message via the "Reply to Ticket" Flow Node. 