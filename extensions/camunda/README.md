# Camunda

Integrates Cognigy.AI with [Camunda](https://camunda.com/), the process orchestration platform based on BPMN.

With this Extension, an AI Agent can hand over the outcome of a conversation to a business process in Camunda 8 SaaS. A typical example is an insurance claim: the AI Agent collects the details of the damage from the customer, and the **Start Process** Node passes these details to Camunda, where a BPMN process takes over the further handling of the claim, such as assigning an adjuster, checking the policy or sending confirmations.

## How it works

Camunda 8 can start processes from external systems through an [HTTP Webhook inbound connector](https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/). When a BPMN process contains a start event (or intermediate catch event) of the type *Webhook*, Camunda publishes a unique URL for it. Every HTTP request sent to this URL starts a new process instance (or correlates with a running one), and the JSON body of the request becomes available to the process as variables.

This Extension calls exactly such a webhook:

1. The Flow reaches the **Start Process** Node.
2. The Node builds the webhook URL from the values stored in the Camunda Connection.
3. The Node builds the JSON payload from the current conversation (`sessionId`, `userId`, `URLToken`), the configured **Text** and the configured **Data**. CognigyScript in these fields, such as `{{input.text}}` or `{{context.claim.amount}}`, is resolved before the request is sent.
4. The Node sends the payload as an HTTP `POST` request with an `Authorization: Bearer <token>` header to Camunda.
5. Camunda validates the token, starts the process and responds.
6. The Node stores the response (or the error) in the Input or Context object and continues the Flow with the **Process Started** or the **Failed** child Node.

```
Cognigy.AI Flow                                  Camunda 8 SaaS
┌────────────────────┐   POST + Bearer token    ┌────────────────────────┐
│ Start Process Node │ ───────────────────────▶ │ Webhook inbound        │
│                    │                          │ connector              │
│                    │ ◀─────────────────────── │   └─▶ BPMN process     │
└─────────┬──────────┘   HTTP status + body     └────────────────────────┘
          │
          ├── Process Started (2xx)
          └── Failed (error / non-2xx)
```

Because `sessionId`, `userId` and `URLToken` are always part of the payload, the Camunda process knows which conversation it belongs to. This allows the process, for example, to send a message back into the same conversation later on through the Cognigy.AI [Inject or Notify API](https://docs.cognigy.com/ai/for-developers/api/) of the Endpoint identified by the `URLToken`.

## Prerequisites in Camunda

1. A Camunda 8 SaaS cluster.
2. A deployed BPMN process with a start event of the type **Webhook Start Event Connector**.
3. Authorization configured on the webhook that accepts the token from the `Authorization` header, for example:
   - **API key**: set the *API key* to your token and the *API key locator* to `=split(request.headers.authorization, " ")[2]`, or
   - **JWT**: if the token is a JWT issued by an identity provider, configure the JWK URL of that provider.
4. The webhook URL, which is shown in the properties panel of the start event in the Camunda Web Modeler once the process is deployed.

## Connection

The Connection stores the token and splits the webhook URL into its parts, so that one Extension can be used for different clusters and connectors by simply creating another Connection. The webhook URL of a Camunda 8 SaaS inbound connector has the following shape:

```
https://<region>.connectors.camunda.io/<clusterId>/inbound/<inboundId>
```

For example, the URL `https://bru-2.connectors.camunda.io/1d5787ce-2bd6-4346-b584-997a5f1d6872/inbound/b8a0eb96-e9b4-43eb-90e3-4a2b93450776` is split up into:

| Field | Description | Example |
|-------|-------------|---------|
| bearerToken | The token that is sent in the `Authorization: Bearer <token>` header. It must match the authorization configured on the inbound connector. | `eyJhbGciOi...` |
| region | The region of the Camunda cluster (the subdomain before `.connectors.camunda.io`) | `bru-2` |
| clusterId | The ID of the Camunda cluster (the path segment before `/inbound`) | `1d5787ce-2bd6-4346-b584-997a5f1d6872` |
| inboundId | The ID of the inbound connector (the path segment after `/inbound`) | `b8a0eb96-e9b4-43eb-90e3-4a2b93450776` |

## Node: Start Process

Sends a `POST` request with a JSON payload to the configured inbound webhook connector and thereby starts (or correlates with) a Camunda process.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| Camunda Connection | Connection | The Camunda Connection described above. |
| Text | CognigyText | Sent as the `text` property of the payload. Default: `{{input.text}}`, the last message of the user. It can be any text or CognigyScript, for example a summary of the conversation. |
| Data | JSON | Sent as the `data` property of the payload. This is the place for all business information the process needs, such as customer, claim or order details. CognigyScript such as `{{input.userId}}` or `{{context.customerName}}` can be used in string values. The field is pre-filled with an example of an insurance claim that can be adjusted or replaced. |
| Storage Option | Select | Whether the result is stored in the Input or the Context object, and under which key. Default: `input.camunda` |

### Payload

The `sessionId`, `userId` and `URLToken` are taken from the current Input object automatically, while `text` and `data` come from the Node fields:

```json
{
  "sessionId": "{{input.sessionId}}",
  "text": "<Text field>",
  "userId": "{{input.userId}}",
  "data": {
    "event": "claim_initiated",
    "customer": { "id": "CUST-12345", "phone": "{{input.userId}}" },
    "claim": { "type": "property_damage", "estimated_loss": 15000 },
    "conversation": { "session_id": "{{input.sessionId}}" }
  },
  "URLToken": "{{input.URLToken}}"
}
```

| Property | Source | Purpose in Camunda |
|----------|--------|--------------------|
| sessionId | `input.sessionId` | Identifies the conversation, e.g. for correlation or for messages back into the conversation |
| text | Text field | Free text, e.g. the user's request or a summary |
| userId | `input.userId` | Identifies the user, e.g. the phone number in a voice conversation |
| data | Data field | The business data the process works with |
| URLToken | `input.URLToken` | Identifies the Cognigy.AI Endpoint, e.g. for the Inject or Notify API |

In the BPMN process, these properties are available through the `request.body` of the webhook connector, for example `request.body.data.claim.estimated_loss`.

### Child Nodes

The Flow continues with one of two child Nodes, depending on the result of the API call:

| Child Node | Description |
|------------|-------------|
| Process Started | The connector responded with a 2xx status code. The process was started. |
| Failed | The request failed, e.g. because of a non-2xx status code (`401` for an invalid token, `404` for an unknown or undeployed connector), or a network error. |

This allows the AI Agent to react accordingly, for example by confirming the claim to the customer or by offering a handover to a human agent if the process could not be started.

### Result

On success, the HTTP status and the response body of the connector are stored:

```json
{
  "status": 200,
  "data": { }
}
```

The response body depends on the configuration of the webhook connector in Camunda (*Response body expression*). It can, for example, return the process instance key or a claim ID that the AI Agent tells the customer.

If the request fails, the error message, HTTP status and response body (if available) are stored instead, and the error is written to the Flow log:

```json
{
  "error": "Request failed with status code 401",
  "status": 401,
  "data": { }
}
```
