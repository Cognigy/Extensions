# Tyntec

With the [Tyntec](https://tyntec.com) Extension, various functionalities are exposed to Cognigy.AI.

## Connection

In order to use the provided Flow Nodes, an **API Key** has to be provided in the Tyntec Connection. This Key can be found in the [My Tyntec Dashboard](https://my.tyntec.com/api-settings).

## Nodes: Send SMS

This Flow Node sends an SMS message to a provided telephone number, while the result is stored in the `input` or `context` object:

```json
{
    "requestId": "...",
    "status": "ACCEPTED",
    "submitDate": "2021-09-23T06:42:57+00:00",
    "href": "https://api.tyntec.com/messaging/v1/messages/...",
    "from": "tyntec",
    "to": "+49...",
    "parts": [
        {
            "partId": "...",
            "submitDate": "2021-09-23T06:42:57+00:00"
        }
    ],
    "size": 1
}
```