# 8x8

## Introduction
This Extension integrates with the 8x8 Statistics, CRM and Schedule API's.


## Upload extension to cognigy platform

1. Run `npm run publish:local` to generate a new tar.gz archive in the target folder.
2. Go to the Cognigy Platform > Manage Section > Extensions.
3. Click on the big blue `+ Upload extension` button and select the zip file from the target folder.

## Connections

**8x8 Connection**

To use the 8x8 extension, you need to create a connection. To do so, follow these steps:
1. Click on the `+` sign.
2. Fill in the fields with the information collected from the VCC Configuration Manager (CM).

| Field               | Description                                                                                                                                                                                                                                                                                    |
| ------------------- |------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| apiKey      | The apiKey for 8x8's apps API access. Will be configured for the desired apps in Admin Console from an Admin's SSO panel. Contact Center Schedule, Contact Center Native CRM, Contact Center Chat Gateway and Analytics for Contact Center apps are needed for current nodes. |
| tenantId            | The tenant ID for 8x8's Contact Center API access. Check [Generate authentication tokens for 8x8 Contact Center APIs](https://docs.8x8.com/8x8WebHelp/VCC/configuration-manager-General/content/integrationapitokentab.htm) for more information. |
| baseUrl      | The base URL from the Agent Workspace or CM instance (https://api.8x8.com). |


## Node: Get Customer

The node allows you to collect customer information and match it with the native CRM. To use this node, you need to create an 8x8 CRM connection (refer to the Connections section for more information).

The node will look up the following case details:
* First Name
* Last name
* Email
* Voice
* Company
* Account Number
* Customer Type
* Custom Fields -> additional fields cand be added from VCC
* Configuration Manager
  -> [CRM fields](https://docs.8x8.com/8x8WebHelp/VCC/configuration-manager-general/content/crmcustomfieldstypes.htm)

### Exit Points:
After the node configuration is completed, it will have two exit points:
* Customer found
* Customer not found


## Node: Get Case

This node allows you to collect customer information and match it with the native CRM case.

The node will look up the following case details:
- Case Number
- Account Number
- Last name of customer
- Company
- Case Status
- Project
- Subject
- Custom Fields
  - Additional fields can be added from VCC Configuration Manager
  - Checkout [Understand types of CRM fields](https://docs.8x8.com/8x8WebHelp/VCC/configuration-manager-General/content/crmcustomfieldstypes.htm) for more information regarding CRM fields.


### Exit Points:
After the node configuration is completed, it will have two exit points:
- Case found
- Case not found


## Node: Test condition of queue

This node allows you to check the condition of a queue before entering a queue. It provides a set of conditions
which when met, will trigger specific actions. The node gives the flow much more routing flexibility by allowing testing queue status repeatedly.

1. 8x8 Simple Connection - Steps for creating a connection are located inside the Connections section
2. Select the queue - The dropdown will display the available queues for which you can test the conditions
3. There are NO agents - The following options are presented when you enable the condition:
* Available
* Available or Busy
* Available, busy, or working offline
* Available, busy, working offline, or on break
* Logged in (assigned but may not be enabled)

To evaluate the condition of a selected queue and then route the interaction based on the test results of that performance, enable one or all of the following tests:
1. The number of interactions waiting ahead of this interaction is greater than - enter the number of interactions
2. There is an interaction in this queue that has been waiting longer than - enter the number of seconds
3. The instantaneous expected-wait-time calculation exceeds - enter the number of seconds

### Exit Points:
After the node configuration is completed, test Queue will have two exit points:
* Condition Matched
* Condition not Matched

## Node: Schedule

This node allows you to check the state of the Contact Center schedule and route interactions accordingly.

### Setup Steps:

1. 8x8 Simple Connection: The steps to create a connection can be found in the Connections section.
2. Select the schedule: The dropdown will show the available schedules.

### Exit Points:

Once the node configuration is completed, it will have 8 exit points:
1. Schedule open: Contact Center is Open.
2. Schedule closed: Contact Center is Closed.
3. Choice 1 to Choice 6 Schedule: Six additional options that provide more refined choices other than Open or Closed for the day.


## Node: Voice Handover

This node allows you to transfer a voice interaction from inside the flow to an 8x8 VCC queue. Once reached inside the flow the node will attempt the transfer to the queue and call Id configured.

### Important requirement:

The customer has the sole responsability to obtain and store to context for later usage the call Id beforehand and firstly during the flow execution. This will be available inside {{input.data.payload.sip.headers["X-8x8-CID"]}}.Other properties will be available on the headers object.

### Setup Steps:

1. 8x8 Simple Connection - Steps for creating a connection are located inside the Connections section
2. Handover Initiated message input - a message that will be uttered during the call when voice handover node has began execution
3. Queue Id - id of a desired queue existing on the tenant id configured inside the connection
4. 8x8 JSON Properties - configure the payload for the request here. Default obligatory value set as default. Values can be changed as required whilst preserving the structure and new additionalProperties objects can be added as needed.

### Exit Points:
No child nodes needed or configured for this. Failure will result in missed handover and the error message logged in Logs.

## Node: Data Augmentation

This node allows you to enrich/augment the additionalProperties sent and displayed to the agent upon voice interaction being served inside AW.

### Important requirement:

The customer has the sole responsability to obtain and store to context for later usage the call Id beforehand and firstly during the flow execution. This will be available inside {{input.data.payload.sip.headers["X-8x8-CID"]}}.Other properties will be available on the headers object.

### Setup Steps:

1. 8x8 Simple Connection - Steps for creating a connection are located inside the Connections section
2. Queue Id - id of a desired queue existing on the tenant id configured inside the connection
3. Use JSON Fields to configure payload - toggle that will switch between 5 sections with label/value input pairs for quick configuration or 8x8 Data Augmentation JSON properties JOSN input for complete control of the payload.
4. 8x8 Data Augmentation JSON properties - configure the payload for the request here. Default model valid value set as default. Values can be changed as required whilst preserving the structure and new  objects can be added as needed.
   More info on the enpoint [8x8 Contact Center Data Augmentation API](https://support.8x8.com/contact-center/8x8-contact-center/developers/8x8_Contact_Center_Data_Augmentation_API)

### Exit Points:
No child nodes needed or configured for this. Failure will result in missed transmission and the error message logged in Logs.

## Node: Schedule Handback to Bot Flow

This node allows you to schedule a handback to bot flow that transitions the conversation to an existing bot flow after the agent interaction is completed. Unlike immediate handovers, this node creates a resource in the 8x8 system that will trigger the bot flow only after the customer-agent conversation enters a post-processing state, ensure seamless continuation of the customer's digital journey after agent interactions, allowing for tasks such as surveys or further automated assistance. The flexible assignment mechanism supports various post-conversation workflows and is designed to be extensible for different use cases after the agent engagement has concluded.


### Important Notes:

- **Scheduling Behavior**: This node doesn't immediately pass the interaction to a bot flow. Instead, it schedules the handback to occur automatically after the agent interaction concludes, to ensure seamless continuation of the customer's digital journey after agent interactions, allowing for tasks such as surveys or further automated assistance.
- **Use Cases**: Perfect for post-interaction surveys, feedback collection, follow-up flows, or any bot interaction that should happen after agent assistance.
- **Conversation ID**: The node automatically retrieves the conversation ID from `input.data.request.conversationId` during execution.

### Setup Steps:

1. **8x8 Simple Connection**: Steps for creating a connection are located inside the Connections section.
2. **Webhook Selection**: Choose the webhook that points to your desired bot flow from the dropdown (populated automatically based on your connection).
3. **Assignment Configuration** (Optional - Advanced Settings):
  - **Assignment Type**: Currently supports 'webhook' type assignments.
  - **Configuration JSON**: Configure timing and notification settings:
    - `notifyChannelWebhookIfExists`: Whether to notify existing channel webhooks (default: "false")
    - `maxTotalMinutes`: Maximum total time limit for the handover session (default: "300")
    - `userTimeoutInMinutes`: User inactivity timeout before ending the session (default: "150")

4. **Storage Options**: Configure where to store the API response:
  - **Input Storage**: Stores result in `input[inputKey]` for current turn processing
  - **Context Storage**: Stores result in `context[contextKey]` for session-wide persistence

### Configuration Example:

```json
{
  "notifyChannelWebhookIfExists": "false",
  "maxTotalMinutes": "300",
  "userTimeoutInMinutes": "150"
}
```

### How It Works:

1. **During Ongoing Conversation**: The node creates a post-agent assignment resource in the 8x8 system
2. **After Agent Ends**: When the agent concludes the interaction, the 8x8 system automatically triggers the configured webhook
3. **Bot Flow Activation**: Your bot flow receives the conversation and continues with post-agent tasks (surveys, follow-ups, etc.)

### Exit Points:
No child nodes needed or configured for this. The node executes once to schedule the handover. Success/failure results are stored in the configured storage location, and any errors are logged in the system logs.

## Node: End Conversation

This node allows you to remove a bot/user participant from the conversation and terminate the interaction. When executed, it sends a request to the 8x8 chat gateway to update the participant status, effectively ending the bot flow conversation.

### Important Notes:

- **Immediate Action**: This node immediately removes the bot/user participant from the conversation.
- **Conversation Termination**: This node is designed to cleanly end conversations, typically used at the completion of a bot flow.
- **Conversation ID**: The node automatically retrieves the conversation ID from `input.data.request.conversationId` during execution.

### Setup Steps:

1. **8x8 Simple Connection**: Steps for creating a connection are located inside the Connections section.
2. **8x8 JSON Properties**: Configure the participant removal payload:
  - `removed`: Boolean flag indicating participant removal (default: true)
  - `displayMessage`: Message shown when ending the conversation

3. **Storage Options**: Configure where to store the API response:
  - **Input Storage**: Stores result in `input[inputKey]` for current turn processing
  - **Context Storage**: Stores result in `context[contextKey]` for session-wide persistence

### Configuration Example:

```json
{
  "removed": true
}
```

### How It Works:

1. **Execution**: The node sends a PATCH request to `/chat-gateway/v1/conversations/{conversationId}/participants/user`
2. **Participant Removal**: The bot/user participant is marked as removed with the specified display message
3. **Conversation End**: The conversation effectively ends from the bot's perspective

### Use Cases:

- **Flow Completion**: End conversations when bot objectives are completed
- **User Opt-out**: Allow users to gracefully exit conversations
- **Timeout Handling**: Automatically end inactive conversations
- **Error Recovery**: Cleanly terminate conversations after unrecoverable errors

### Exit Points:
No child nodes needed or configured for this. The node executes once to end the conversation. Success/failure results are stored in the configured storage location, and any errors are logged in the system logs.
