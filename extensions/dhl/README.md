# DHL Functionatlity Extension

This extension allows you to access made available via the DHL API. In order to use this extension you will create an account in the [DHL Developer Portal](https://developer.dhl.com/documentation) and create an API key. If you are already a DHL customer please contact your customer service agent and ask for assitance as other conditions may apply.  

## Connection: DHL API Keys

After signing up for an account you can find intructions on how to create a key in [their user guides](https://developer.dhl.com/api-reference/shipment-tracking#get-started-section/user-guide).

The Extension then requires the following information: 

- apiKey: The API key in your user settings.
- apiSecret: The API secret in your user setting.

---
### Node: Get Tracking Information

This node can retrieve tracking information for a specific shipment based on the tracking number. It also allows the flow designer to determine what types of shipments can be tracked in their flow. For example, the designer can determine that only express shipments can be searched. This function can be toggled on and off, meaning a specific service does not need to be specified. 

**Fields:**

- Tracking Number: The tracking number of the shipment. 
- Response language: The ISO 639-1 2-character language code for the response. If the language is not available the response is automatically sent in English, as long as a valid language code has been given. 
- Specify DHL Service: Determine if tracking should only be allowed for a specifice DHL service.
- DHL Service: For which service should the tracking be allowed. 
- Where to Store the Result: The selection, where to store the list (either in `context` or `input`)
- Input Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- Context Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)

---
### Node: Get DHL Location

This node allows the user to find a nearby DHL location. This can either be done via address or via geo location for example in combination with the [Get User Location](https://support.cognigy.com/hc/en-us/articles/360019600399-Webchat-Plugins-Overview) plugin.

**Fields:**

- Search Type: The type of search which should be used to find DHL locations. `Geo Coordinates` allows the designer to use the longitude and latitude of the user in oder to find the nearest locations. `Address` allows the street address to be used.
- Search Radius in Meters: The search radius for the query. The maximum search radius is 25000 meters. 
- Limit: The amount of results which should be returned. Maximum is 50.
- Where to Store the Result: The selection, where to store the list (either in `context` or `input`)
- Input Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- Context Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)

Search Type `Address`
- Street and House Number: For example, "123 Main Street".
- Postal Code: The postal or zip code of the address to be used as a basis for the search.  
- City/Town: The city used as a basis for the search. 
- Country Code: The code for the country as [ISO 3166-1 alpha-2 code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)

Search Type `Geo Coordinates`
- Longitude: The longitude for the basis of the search. 
- Latitude: The latitude for the basis for the search.