# UPS

With this Extension the Cognigy.AI Virtual Agent can provide detailed information about UPS shipments based on a given tracking number.

## Connection

In order to be authorized as application, one has to provide the so-called
- accessKey

in a Cognigy Connection. Please request an Access Key in the UPS Developer Portal: https://www.ups.com/upsdeveloperkit.

## Nodes: Track Shipment

This Flow Node takes a valid UPS Tracking Number as parameter and returns the details in JSON format. The result can be stored in the Input or Context or Cognigy.AI and looks similar to this:

```json
{
  "ups": {
    "trackResponse": {
      "shipment": [
        {
          "inquiryNumber": "...",
          "package": [
            {
              "trackingNumber": "...",
              "deliveryDate": [
                {
                  "type": "SDD",
                  "date": "123123123"
                },
                {
                  "type": "DEL",
                  "date": "123123123"
                }
              ],
              "deliveryTime": {
                "type": "DEL",
                "endTime": "123123123"
              },
              "activity": [
                  },
                  "status": {
                    "type": "M",
                    "description": "Shipper created a label, UPS has not received the package yet. ",
                    "code": "MP",
                    "statusCode": "000"
                  },
                  "date": "123123123",
                  "time": "123123123"
                }
              ],
              "packageCount": 1
            }
          ]
        }
      ]
    }
  }
}
```