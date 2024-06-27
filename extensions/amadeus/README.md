# Amadeus

This Extension integrates [Amadeus](https://amadeus.com/en) in order to retrieve travel specific information.

## Connection

Amadeus uses OAuth2 for authentication. Please follow this official guide to create your credentials: https://developers.amadeus.com/get-started/get-started-with-self-service-apis-335

- apiUrl
  - e.g. https://test.api.amadeus.com
- clientId
- clientSecret

## Node: Search Flights

Based on the selected `searchOption`, this Flow Node uses one of the following API Endpoints:

- Search Option: "Standard"
  - API: [Flight Offers Search](https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-search)
- Search Option: "Cheapest Date"
  - API: [Flight Cheapest Date Search](https://developers.amadeus.com/self-service/category/flights/api-doc/flight-cheapest-date-search/api-reference)

## Node: Search Airports

Based on the provided `keyword`, this Flow Node uses the [Airport Search API](https://developers.amadeus.com/self-service/category/flights/api-doc/airport-and-city-search/api-reference) in order to find one or more airports.