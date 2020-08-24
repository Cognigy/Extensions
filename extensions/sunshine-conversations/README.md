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