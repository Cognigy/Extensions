# Here

Adds [**Here**](https://developer.here.com/) specific features as Flow Nodes to Cognigy.AI. 

**Connection:**

- 1.
  - key:  appId,
  - value*:  Your APP ID for the HERE REST APIs 
- 2. 
  - key:  apiKey
  - value*:  Your API Key for the HERE REST APIs 

You you can generate the APP ID and an APP CODE for the **Here** REST APIs for free with your **Here** developer account [here](https://developer.here.com/develop/rest-apis?create=Freemium-Basic).

## Node: Get Location

Get current geolocation by free text in a format of

```json
{
    "here": {
      "location": {
        "items": [
          {
            "title": "ALDI",
            "id": "here:pds:place:276jx7ps-10b10d39ff730db2f0036de94b742eac",
            "resultType": "place",
            "address": {
              "label": "ALDI, Duisburger Straße 24, 40477 Düsseldorf, Deutschland",
              "countryCode": "DEU",
              "countryName": "Deutschland",
              "state": "Nordrhein-Westfalen",
              "county": "Düsseldorf",
              "city": "Düsseldorf",
              "district": "Pempelfort",
              "street": "Duisburger Straße",
              "postalCode": "40477",
              "houseNumber": "24"
            },
          }
        ]
      }
    }
}
```