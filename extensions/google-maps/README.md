# Google Maps
Integrated Cognigy.AI with Google Maps (https://developers.google.com/maps/documentation/)

**Connection**

- key:  api_key, key
- value: Your Google Maps API KEY
  - Geocode API, JavaScript Maps SDK, Directions API

## Node: Show Google Maps

**Properties**

There are two ways to use this Extension. Use the [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/start) to get the longitude and latitude of the address. 

*IMPORTANT: You need to enable the **Geocoding API** and the **Maps JavaScript API**, while the first one is used to get the latitude and longitude from the search query and the second one to show it with the webchat plugin.*

If the Searchquery field is empty or no Place was found, the module use the default values from Latitude and Longitude. 

**View**

In combination with the google-maps Webchat Plugin you get this view:
![Create Location Node](./docs/google-maps-Webchat.png)

## Node: Search Location

This node can be used in order to get location information about the current user.

### Address

In order to get the user location, one can ask for the it via plain text. The minimum information required from the user to execute this node is: `place`, `city`, and `country`. 

This node returns the closest location google maps can provide based on the given data (`place`):

```json 
{
  "place": {
    "coordinates": {
      "latitude": 51.2139586,
      "longitude": 6.7489951
    },
    "address": "Speditionstraße 1, 40221 Düsseldorf, Germany",
    "name": "Cognigy"
  }
}
```

### Coordinates

Since it could be the case that one only retrieves the **longitude** and **latitude** information, the reserve way can be used. In this case, this node returns the **formatted address** based on the geocodes:

```json
{
  "maps": {
    "address": "Speditionstraße 1, 40221 Düsseldorf"
}
```

## Node: Get Directions

Last but not least, the Get Directions Flow Node can be used in order to provide instructions within a chat or voice conversation. This Node takes an `origin`, `destination` and `mode` parameter, while it could be the following:

- Origin: Speditionstraße 1, 40221 Düsseldorf
- Destination: Speditionstraße 4, 40221 Düsseldorf
- Mode: Driving

The result will return all required legs to take:

```json
{
  "google": {
    "directions": {
      "location": [
        {
          "bounds": {
            "northeast": {
              "lat": 0,
              "lng": 0
            },
            "southwest": {
              "lat": 0,
              "lng": 0
            }
          },
          "copyrights": "Map data ©2021 GeoBasis-DE/BKG (©2009)",
          "legs": [
            {
              "distance": {
                "text": "0.5 km",
                "value": 455
              },
              "duration": {
                "text": "2 mins",
                "value": 126
              },
              "end_address": "Speditionstraße 1, 40221 Düsseldorf",
              "end_location": {
                "lat": 0,
                "lng": 0
              },
              "start_address": "Speditionstraße 4, 40221 Düsseldorf",
              "start_location": {
                "lat": 0,
                "lng": 0
              },
              "steps": [
                {
                  "distance": {
                    "text": "0.1 km",
                    "value": 98
                  },
                  "duration": {
                    "text": "1 min",
                    "value": 22
                  },
                  "end_location": {
                    "lat": 0,
                    "lng": 0
                  },
                  "html_instructions": "Head <b>northwest</b> on <b>Speditionstraße</b>",
                  "polyline": {
                    "points": "w`ywHgcyg@s@f@CBCBCBEDAB?B@D@D?H?F?DCDCBu@h@"
                  },
                  "start_location": {
                    "lat": 0,
                    "lng": 0
                  },
                  "travel_mode": "DRIVING"
                },
                "...": "..."
              ]
            }
          ]
        }
      ]
    }
  }
}
```