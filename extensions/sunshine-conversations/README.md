# Sunshine Conversations Commands

This Extension integrats Cognigy with the [Sunshine Conversations V2.0 API](https://docs.smooch.io/eap/v2-api-spec.pdf) and performs switchboard and conversation notifiaction and control tasks.

**Connection:**

- keyId: Sunshine Application API Key ID
- secret: Sunshine Application API Key Secret
- appId: The Sunshine Conversation application ID
    - Please follow the [Setup a Sunshine Conversation Endpoint Instructions](https://docs.cognigy.com/docs/deploy-a-smooch-endpoint) to get these values.

## Node: Offer Control

This node offers control to the integration as set in the node settings:

- Switchboard Integration Name (pass to): Use either 'next' or 'agent'
- [API Source](https://docs.smooch.io/eap/v2-api-spec.pdf)

## Node: Pass Control

This node passes control to the integration as set in the node settings (not recommended for agent handover):

- Switchboard Integration Name (pass to): Use either 'next' or 'agent'
- [API Source](https://docs.smooch.io/eap/v2-api-spec.pdf)

## Node: Start Typing

This node notifys the user that the bot is typing to mimic a human reaction. Combine this with a sleep node for optimal results.

- [API Source](https://docs.smooch.io/eap/v2-api-spec.pdf)

## Node: Stop Typing

This node cancels the typing command of the start typing node.

- [API Source](https://docs.smooch.io/eap/v2-api-spec.pdf)

## Node: Conversation Read

This node notifys the user that the bot had read the conversation.

- [API Source](https://docs.smooch.io/eap/v2-api-spec.pdf)