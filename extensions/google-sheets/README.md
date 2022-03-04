# Google Sheets

With this Extension one can use the [Google Sheets API](https://console.cloud.google.com/).

**Connection**

To use the Google Cloud you'll need a Google Service Account json key file for the connection config. To generate the key file:

  - [Create](https://cloud.google.com/resource-manager/docs/creating-managing-projects) a Google Cloud Platform project.
  - [Enable](https://console.cloud.google.com/apis/library/sheets.googleapis.com?q=spreadsheet&supportedpurview=project) the Sheets API
  - Go to the service account [page](https://console.cloud.google.com/iam-admin/serviceaccounts), select your project and create a new service account.
  - Choose the `Create Service Account` button at the top
    - Enter a name and choose `Create and Continue`
    - Click `Continue` on step 2 and `Done` on step 3
  - Under the `Actions` choose `Manage Keys`
  - Click `Add Key`
  - Create a `json` key and download

When you create a new Google node, add a Service Account and paste the contents of the json file.

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

## Node: Append Values

To append cells, the `values` option expects an array of strings. For example:

```json
[
    "{{profile.firstname}}",
    "{{profile.lastname}}",
    "{{profile.email}}",
    "{{context.phone_number}}",
    "{{context.callback}}"
]
```

Returns response to the store location set by the node, either `context` or `input`.
