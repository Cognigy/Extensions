# FedEx

With this Extension, the Cognigy.AI virtual agent can provide detailed information about an existing FedEx shipment.

## Connection

In order to use the Extension, the `serverUrl`, `clientId`, and `clientSecret` must be provided in a [Connection](https://docs.cognigy.com/ai/resources/build/connections/). More information can be found here: https://developer.fedex.com/api/en-us/catalog/authorization/v1/docs.html#operation/API%20Authorization

<i>The `serverUrl` is `https://apis-sandbox.fedex.com` for the FedEx Sandbox.</i>

## Nodes: Track Shipment

Based on the **Tracking Number**, the detailed information about this shipment is returned. More information about this can be found here: https://developer.fedex.com/api/en-us/catalog/track/v1/docs.html#operation/Track%20by%20Tracking%20Number