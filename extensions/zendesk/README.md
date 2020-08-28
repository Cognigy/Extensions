# Zendesk

Integrates Cognigy.AI with the Zendesk Ticketing System (https://www.zendesk.com)

This Extension is based on node-zendesk (https://www.npmjs.com/package/node-zendesk)

**Connection:**

- Zendesk User
  - username
  - token
  - remoteUri

## Node: Create Ticket
The ticket has to be in this format:

```JSON
{ 
    "ticket": {
        "subject":  "My printer is on fire!",
        "description": "It just started smoking after printing my Alexa song",
        "comment":  { "body": "The smoke is very colorful." },
        "priority": "urgent",
        "requester_id": 372568912132
    }
}
```