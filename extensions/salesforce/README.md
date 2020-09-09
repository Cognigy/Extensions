Integrates Cognigy.AI with Salesforce (https://www.salesforce.com)

**Connection (Live Chat)**

If one wants to use the **Start Live Chat** Node, another connection is required. The following keys need to be included:

- organizationId
  - Your Salesforce Organization ID
  - [How to find](https://help.salesforce.com/articleView?id=000325251&type=1&mode=1)
- deploymentId
  - The ID of your Salesforce Deployment
- livechatButtonId
  - The ID of your live chat button
- liveAgentUrl
  - The URL of your live agent

Please have a look at this tutorial in order to get all required values: [Get Chat Settings from Your Org](https://developer.salesforce.com/docs/atlas.en-us.noversion.service_sdk_ios.meta/service_sdk_ios/live_agent_cloud_setup_get_settings.htm)


The following Nodes provide various methods for the [Salesforce Service Cloud](https://www.salesforce.com/de/campaign/sem/service-cloud/).

## Node: Start Live Chat

This Node creates a new Salesforce Live Chat session and chat request. If it returned that `startedLiveChat` equals `true`, the live agent should received a chat request in the Salesforce Service Console:

```json
"liveChat": {
    "session": {
      "key": "ee809075-...KQt3Z98S+M=",
      "id": "ee809075-...377eaa4d11f0",
      "clientPollTimeout": 40,
      "affinityToken": "84aa1ta1"
    },
    "startedLiveChat": true
  }
```

Inside the **Salesforce Service Console**:

![Chat Request](./docs/chatrequest.png)

## Node: Check Live Agent Availability

Checks whether there is a free agent for the provided live chat button. It returns the following format:

```json
"available": {
    "messages": [
      {
        "type": "Availability",
        "message": {
          "results": [
            {
              "id": "5733f000000sdfgd",
              "isAvailable": true
            }
          ]
        }
      }
    ]
  }
```

In order to get the information, one has to turn on that an agent can **decline a chat request** in Salesforce:

![Configuration](./docs/defaultpresenceconfig.png)


## Node: Stop Live Chat

As soon as the user is finished with the agent conversation, this Node can be used to stop the curent live agent session. One needs the `liveAgentAffinity` and `liveAgentSessionKey` which were stored into the context before. After executing this Node, the Salesforce Live Agent chat will end and the Node will return `true`.

## Node: Send Message To Live Agent

In order to send a message to the current live agent session, this Node is required. One needs the `liveAgentAffinity` and `liveAgentSessionKey` which were stored into the context before -- by **Start Live Chat**. Furthermore, a `text` message must be defined. After sending a message, this node doesn't return anything.