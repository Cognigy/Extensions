# Google Sheets

With this Extension one can use the [Google Sheets API](https://console.cloud.google.com/).

**Connection**

To use the Google Cloud one needs to enable a the **Google Sheets API** in the Google Cloud Console. After getting the `API_KEY` one has to define a Cognigy Connection as the following: 

- Key: **key**
- Value: **API_KEY**

## Node: Get Spreadsheet

With this node one can retrieve information dynamically from a Google Spreadsheet. The result would look similar to the following:

```json
{
  "spreadsheet": {
    "length": 1,
    "result": {
      "range": "Table!A2:G30",
      "majorDimension": "ROWS",
      "values": [
        [
          "firstValue",
          "secondValue",
          "thirdValue",
        ]
      ]
    }
  }
}
```