# Zendesk

Integrates Cognigy.AI with the Zendesk Ticketing System (https://www.zendesk.com)

## Connection

**Zendesk**:

- **username**
  - The username of the Zendesk user
- **password**
  - The password of the Zendesk user
- **subdomain**
  - e.g. 'cognigy' or 'my-company'
  - One can find this in the company Zendesk URL, such as cognigy.zendesk.com

**Zendesk Chat**:

- **client_id**
  - The Zendesk Chat client id
- **client_secret**
  - The Zendesk Chat client secret

## Flow Nodes

All exposed Flow Nodes of this Extension follow the [Zendesk API](https://developer.zendesk.com/api-reference) whereby the respective result returns `response.data` if there is a list of results -- e.g. articles.

### Exposed Nodes

- *Support*
  - [Create Ticket](https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#create-ticket)
  - [Get Ticket](https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#show-ticket)
  - [Update Ticket](https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#update-ticket)
- *Help Center*
  - [Search Articles](https://developer.zendesk.com/api-reference/help_center/help-center-api/search/)
  - [Get Categories](https://developer.zendesk.com/api-reference/help_center/help-center-api/categories/)
- *Live Chat*
  - [Check Agent Availability](https://developer.zendesk.com/api-reference/live-chat/real-time-chat-api/rest/#get-agent-status-counts)
  - [Start Live Chat](https://api.zopim.com/web-sdk/#zchat-init-options)
    - Please follow this Help Center article to set up the Zendesk Live Chat: [Zendesk: Handover Webchat Conversations to Agent Workspace](https://support.cognigy.com/hc/en-us/articles/4405558481938)
- *Talk*
  - [Get Phone Numbers](https://developer.zendesk.com/api-reference/voice/talk-api/phone_numbers/#list-phone-numbers)
  - [Request Callback](https://developer.zendesk.com/api-reference/voice/talk-api/callback_requests/)