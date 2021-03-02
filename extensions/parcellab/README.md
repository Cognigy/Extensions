# Parcel Lab

This Extension integrates the [ParcelLab API](https://how.parcellab.works/docs/).

**Connection:**

- Parcel Lab
  - key: user
  - value: The Parcel Lab API user id (e.g. 1617915)

## Node: Get Parcel Info

Returns the parcel information of a specific `orderNumber` in a specific `language`:

```json
  "parcel": {
    "length": 1,
    "result": {
      "header": [
        {
          "id": "...",
          "tracking_number": "...",
          "actionBox": {
            "type": "order-processed",
            "label": "..."
          },
          "courier": {
            "name": "dhl-germany",
            "prettyname": "DHL",
            "trackingurl": "https://nolp.dhl.de/nextt-online-public/de/set_identcodes.do?idc=...",
            "hide_trackingurl": false,
            "trackingurl_label": "...",
            "rerouteurl": "https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=...",
            "rerouteurl_label_short": "...",
            "rerouteurl_label_long": "...",
            "rerouteurl_label_info": "...",
            "destinationCourier_name": "DHL"
          },
          "last_delivery_status": {
            "code": "...",
            "status": "...",
            "status_details": "...",
            "specifics": "..."
          },
          "delay": false,
          "exception": true
        }
      ],
      "body": {
        "5ad3973a145c910dc4e99b0b": [
          {
            "location": "",
            "timestamp": "2018-04-01T00:00:00.000Z",
            "status": "OrderProcessed",
            "status_text": "...",
            "status_details": "...",
            "shown": true,
            "full_courier_status": "..."
          },
        ]
      }
    },
    "statusCode": 200
  },
```