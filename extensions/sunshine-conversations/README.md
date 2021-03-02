# Sunshine Conversations Commands

This Extension integrats Cognigy with the [Sunshine Conversations V2.0 API](https://docs.smooch.io/eap/v2-api-spec.pdf) and performs switchboard and conversation notifiaction and control tasks.

**Connection:**

- keyId: Sunshine Application API Key ID
- secret: Sunshine Application API Key Secret
- appId: The Sunshine Conversation application ID
    - Please follow the [Setup a Sunshine Conversation Endpoint Instructions](https://docs.cognigy.com/docs/deploy-a-smooch-endpoint) to get these values.

### First Time Integration Setup (Zendesk):

When you setup the Zendesk integration for live agent handovers for the first time, you need to `PATCH` the integration parameters by using the following documentation: https://docs.google.com/document/d/1iEW6yHEQx1TmyHkBDyXKtpihRUcpYvqvqIPIW6GP8Rk/

1. Scroll down to Zendesk
2. Use the Update your bot's switchboard integration API request to update the two parameters:
   1. "deliverStandbyEvents": false
   2. "messageHistoryCount": 10

## Node: Offer Control

This node offers control to the integration as set in the node settings:

- Switchboard Integration Name (pass to): Use either 'next' or 'agent'
- [API Source](https://docs.smooch.io/eap/v2-api-spec.pdf)

## Node: Pass Control

**Important: This node is required for passing control to live agent if you use Zendesk as integration.**

This node passes control to the integration as set in the node settings (not recommended for agent handover):

- Switchboard Integration Name (pass to): Use either 'next' or 'agent'
- [API Source](https://docs.smooch.io/eap/v2-api-spec.pdf)


# Helpful Links

- Sunshine Conversations
  - [V2 Api Specifications](https://docs.smooch.io/eap/v2-api-spec.pdf)
  - [How to integrate with Switchboard](https://docs.google.com/document/d/1iEW6yHEQx1TmyHkBDyXKtpihRUcpYvqvqIPIW6GP8Rk/)
  - [Bot Partner Program Overview](https://docs.google.com/document/d/1pgNJxD038jzI-lwiedRfOpsKVNg8t0qRKzly7ODloXg/edit?ts=5eea57a6#heading=h.e95922o17ii)
  - [[External] Sunshine Conversations Switchboard - Early Access Documentation](https://drive.google.com/file/d/1lt_SYsKpUNVBkxsm8z3ApwY6hEjMmFAo/view)
- Zendesk
  - [Creating Macros For Tickets](https://support.zendesk.com/hc/en-us/articles/115001236988-Creating-macros-for-tickets)
  - [About triggers and how they work](https://support.zendesk.com/hc/en-us/articles/203662246-About-triggers-and-how-they-work#:~:text=Triggers%20do%20not%20run%20or,must%20be%20smaller%20than%2065k)