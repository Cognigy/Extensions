# Open Weather Map Extension

This Extension integrates Cognigy with the [Open Weather Map](https://openweathermap.org/).

**Connection:**

- key: api_key
- value: Your Open Weather Map API Key
    - [Subscribe here](https://openweathermap.org/price)

## Node: getAllWeather

This node returns the entire weather data of a chosen city: 

```json
"allWeather": {
    "coord": {
      "lon": 6.96,
      "lat": 50.94
    },
    "weather": [
      {
        "id": 800,
        "main": "Clear",
        "description": "clear sky",
        "icon": "01d"
      }
    ],
    "base": "stations",
    "main": {
      "temp": 19.76,
      "pressure": 1026,
      "humidity": 67,
      "temp_min": 16.11,
      "temp_max": 25
    },
    "visibility": 10000,
    "wind": {
      "speed": 2.1,
      "deg": 140
    },
    "clouds": {
      "all": 0
    },
    "dt": 1566547185,
    "sys": {
      "type": 1,
      "id": 1271,
      "message": 0.0087,
      "country": "DE",
      "sunrise": 1566534672,
      "sunset": 1566585540
    },
    "timezone": 7200,
    "id": 2886242,
    "name": "Cologne",
    "cod": 200
  }
```