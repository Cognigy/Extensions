# Facebook Messenger

Use this Extension to perform custom Facebook Messenger functions. In order to use this, your project needs to use the [Messenger Endpoint](https://docs.cognigy.com/docs/facebook-messenger#custom-messages).

**Connection**

The **Get User Location** nodes require a [Cognigy Secret](https://docs.cognigy.com/docs/secrets#using-secrets-in-a-custom-module) in order to access the [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding/start). The following points show the format of the required Connection:

- Google Maps
  - key: key
  - value: Google API Key (Geocoding API)



## Node: Get User Location From Pinned Location Message 

With this node you can use the Facebook location data that is sent from a user by a [pinned location message](https://www.facebook.com/help/messenger-app/583011145134913). 

The location data is forwarded to the Google Geocoding API which returns the formatted address. After executing this node, the following data object is stored to the [Cognigy Context](https://docs.cognigy.com/docs/context-object) -- the example below uses "location" as context key.

``` json
{
    "location": {
        "user": {
            "latitude": 51.12355,
            "longitude": 6.23534
        },
        "address": "Speditionstraße 1, 40221 Düsseldorf, Germany"
    }
}
```

**IMPORTANT**

**The user must send a pinned location message to the AI, otherwise the "Get User Location From Pinned Location Message" node will not work and return an error message.**

## Node: Get User Location From Text Message

If the user does not send their current location using a [pinned location message](https://www.facebook.com/help/messenger-app/583011145134913), one can ask for the user location via plain text. The minimum information required from the user to execute this node is: `place`, `city`, and `country`. 

This node returns the same result as the **Get User Location From Pinned Location Message** node, except in this case the returned location is not the user's current location but the closest location google maps can provide based on the given data (`place`):

```json 
{
  "place": {
    "user": {
      "latitude": 51.2187843,
      "longitude": 6.8123665
    },
    "address": "Erkrather Str. 207, 40233 Düsseldorf, Germany"
  }
}
```