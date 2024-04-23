# Parcel Perform

This Extension integrates with the [Parcel Perform](https://www.parcelperform.com/) system.

## Connection

In order to connect this integration with Parcel Perform, an **API Integration** must be configured within Parcel Perform. With that in place, the required

- clientId
- clientSecret

are available. More can be read in the [official documentation](https://developers.parcelperform.com/docs/api-guides-reference/768e98a8ab866-authentication).

## Node: Get Shipment

Based on the available information the user has at hand, this Flow Node expects the `trackingNumber`, `orderId` or `shipmentId` in order to search for a fitting shipment in the system. If one was found, the "Found" path is executed, if not the "Not Found" one is the next. The result is stored in the input or context object, based on the preferred configuration:

```json
{
  "parcelperform": {
    "shipment_uuid": "...",
    "shipment_id": "...",
    "tracking_number": "12345...",
    "carrier": "FedEx",
    "status": "active",
    "current_phase": {
      "name": "Transit",
      "key": "E"
    },
    "created_date": "2024-04-22T11:44:24+00:00",
    "updated_date": "2024-04-23T06:10:48+00:00",
    "order": {
      "order_uuid": null,
      "order_id": null
    },
    "latest_event": {
      "event": "Shipment en route",
      "date_time": "2024-04-23T14:01:00+08:00",
      "timezone": "Etc/GMT-8",
      "location": {
        "place": "Shanghai, Shanghai, China"
      }
    }
  }
}
```