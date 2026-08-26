Integrates Cognigy.AI with Twilio (https://www.twilio.com)

This Extension talks to the [Twilio REST API](https://www.twilio.com/docs/usage/api) and authenticates using a Twilio [API Key](https://www.twilio.com/docs/usage/api/keys).

### Connection
This Extension needs a Connection to be defined and passed to the Nodes. The Connection must have the following keys:

- API Key SID
  - key: **apiKeySid**
  - value: Your Twilio API Key SID (starts with `SK...`)
- API Key Secret
  - key: **apiKeySecret**
  - value: The secret that was shown when the API Key was created
- Account SID
  - key: **accountSid**
  - value: Your Twilio Account SID (starts with `AC...`)

# Node: sendSMS

[Twilio Docs on sending SMS](https://www.twilio.com/docs/sms/send-messages#send-an-sms-with-twilios-api)

You need the `from` Sender SMS Number, the `to` Recipient SMS Number and the `body` SMS content (max. 1600 characters).

The Node has two child Nodes that control the flow depending on the outcome:

- **On Success** – the SMS was accepted by Twilio.
- **On Error** – sending the SMS failed (validation error or an error response from Twilio).

In both cases the result (the Twilio response on success, or the error payload on failure) is written to the configured Input or Context key.

On success the Node returns the following information: 

```json
{
  "account_sid": "ACfcf5c5de99cbde37e587b72ed8db458f",
  "api_version": "2010-04-01",
  "body": "Hello! 👍",
  "date_created": "Thu, 30 Jul 2015 20:12:31 +0000",
  "date_sent": "Thu, 30 Jul 2015 20:12:33 +0000",
  "date_updated": "Thu, 30 Jul 2015 20:12:33 +0000",
  "direction": "outbound-api",
  "error_code": null,
  "error_message": null,
  "from": "+14155552345",
  "messaging_service_sid": "MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "num_media": "0",
  "num_segments": "1",
  "price": "-0.00750",
  "price_unit": "USD",
  "sid": "MMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "status": "sent",
  "subresource_uris": {
    "media": "/2010-04-01/Accounts/ACfcf5c5de99cbde37e587b72ed8db458f/Messages/SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Media.json"
  },
  "to": "+14155552345",
  "uri": "/2010-04-01/Accounts/ACfcf5c5de99cbde37e587b72ed8db458f/Messages/SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.json"
}
```
