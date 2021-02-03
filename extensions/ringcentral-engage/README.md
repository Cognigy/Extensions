# RingCentral Engage Digital

With this Extension you can use the [RingCentral Engage API](https://developers.ringcentral.com/engage/api-products/) to create interaction between Cognigy and the Engage Digital solution used by Contact Center.

**Connection**

To use the API you need to enable a specific `API_KEY` link to an `API_TOKEN` in your Engage Digital Administration module and use them to configure your RingCentral endpoint in Cognigy.


## Node: Handover

This node automatically change the skill of a conversation to make this conversation available to an agent. Note that all the the conversation will be available for the agent including all the messages sent before the handover.

## Node: Close Intervention

This node will allow Cognigy to close a conversation without the need of an agent with an handover. It makes sense for cases where you set-up your flow in a way that Cognigy is able to handle the full request of a customer.

The conversation will remain available in RingCentral Engage Digital **history and Analytics**.
