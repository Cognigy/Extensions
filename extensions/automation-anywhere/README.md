# Automation Anywhere Extension

Integrates Cognigy.AI with Automation Anywhere (https://www.automationanywhere.com/).

## Connection

This Extensions needs a Connection to be defined and passed to the Nodes. The Connection must have the following keys:

- Url
  -  key: url 
  - value: e.g. https://xxx.automationanywhere.digital
- Username
  - key: username
  - value: e.g. bob@test.com
- Password
  - key: password
  - e.g. adfadkjf1SF

(The Extension generates a token based on your username and password)

NOTE: This integration is based on the V2 API

## Node: Deploy Automations

Deployment API that takes a file id for a bot and deploys it on one or more devices via device ids. To get all devices you can execute the **List Devices** node and **List Automations** for accessing all ids of your bots. The deploy node returns the id of the current running bot process:

```json
"bot": {
  "automationId": "33"
}
```

If you want to use Bot Variables the structure has to look like the following: 

```json
{
    "variable1": {
      "string": "value"
    },
    "variable2": {
      "list": [
        "value1",
        "value2"
      ]
    },
    "variable3": {
      "array": [
        [
          "value11",
          "value12"
        ],
        [
          "value21",
          "value22"
        ]
      ]
    }
}
```

To run your Automation Anywhere robot you have to choose a user with admin rights. Furthermore, you can't be logged in with the same user account on your device (where the robot is started) and inside Cognigy to execute the node via your Cognigy Connection.

## Node: List Automations
Retrieves bot details from the bot name, so that file id from it can be passed to the deployment API. Use ‘eq’ or ‘substring’ operator with field as ‘name’ and bot name in the ‘value’ of the filter, to get bot details of all the bots matching the bot name provided. Additional filtering, ordering and pagination rules can be requested.

```json 
{
  "fields": [
    "string"
  ],
  "filter": {
    "operator": "NONE",
    "operands": [
      null
    ],
    "field": "string",
    "value": "string"
  },
  "sort": [
    {
      "field": "string",
      "direction": "asc"
    }
  ],
  "page": {
    "offset": 0,
    "length": 0
  }
}
```
## Node: List Bot Executions
Returns a list of bot executions based on filtering, ordering and pagination rules. Fetches execution status for specific automation id as returned by the deployment API.

```json 
{
  "fields": [
    "string"
  ],
  "filter": {
    "operator": "NONE",
    "operands": [
      null
    ],
    "field": "string",
    "value": "string"
  },
  "sort": [
    {
      "field": "string",
      "direction": "asc"
    }
  ],
  "page": {
    "offset": 0,
    "length": 0
  }
}
```

## Node: List Devices
Retrieves devices, so that device ids from it can be passed to the deployment API. Additional filtering, ordering and pagination rules can be requested.

```json 
{
  "fields": [
    "string"
  ],
  "filter": {
    "operator": "NONE",
    "operands": [
      null
    ],
    "field": "string",
    "value": "string"
  },
  "sort": [
    {
      "field": "string",
      "direction": "asc"
    }
  ],
  "page": {
    "offset": 0,
    "length": 0
  }
}
```