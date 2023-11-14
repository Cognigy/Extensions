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
| clusterBaseUrl      | The cluster base URL from the Agent Workspace or CM instance (e.g. https://vcc-eu3.8x8.com). |


## Node: Get Customer

The node allows you to collect customer information and match it with the native CRM. To use this node, you need to create an 8x8 CRM connection (refer to the Connections section for more information).

The node will look up the following case details:
* Account Number
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




