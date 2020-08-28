Integrates Cognigy.AI with the Zendesk Ticketing System (https://www.zendesk.com)

This module is based on node-zendesk (https://www.npmjs.com/package/node-zendesk)

### Secret
This modules needs a CognigySecret to be defined and passed to the Nodes. The secret must have the following keys:

- username
- token
- remoteUri

### createTicket
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