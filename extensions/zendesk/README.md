﻿# Zendesk

Integrates Cognigy.AI with the Zendesk Ticketing System (https://www.zendesk.com)

## Connection

- **username**
  - The username of the Zendesk user
- **password**
  - The password of the Zendesk user
- **subdomain**
  - e.g. 'cognigy' or 'my-company'
  - One can find this in the company Zendesk URL, such as cognigy.zendesk.com

## Flow Nodes

All exposed Flow Nodes of this Extension follow the [Zendesk API](https://developer.zendesk.com/api-reference) whereby the respective result returns `response.data` if there is a list of results -- e.g. articles.

### Exposed Nodes

- *Support*
  - [Create Ticket](https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#create-ticket)
  - [Get Ticket](https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#show-ticket)
  - [Update Ticket](https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#update-ticket)
- *Help Center*
  - [Search Articles](https://developer.zendesk.com/api-reference/help_center/help-center-api/search/)