# Microsoft Sharepoint

**Connection:**

- [Docu](https://github.com/s-KaiNet/node-sp-auth/wiki/SharePoint%20Online%20addin%20only%20authentication)

Values: 

- key: clientId
    - value: Microsoft Login username (e.g. email)
- key: clientSecret
    - value: Microsoft Login password

## Node: Get Sharepoint Site Info

Returns the entire information of a given Sharepoint site. Therefore, you have to define the `url` as `https://[your-tenant].sharepoint.com/sites/[your-site]`.

```json
{
  "info": {
    "d": {
      "__metadata": {
        "id": "https://sharepoint.com/sites/TestWebseite/_api/Web",
        "uri": "https://sharepoint.com/sites/TestWebseite/_api/Web",
        "type": "SP.Web"
      },
      "FirstUniqueAncestorSecurableObject": {
        "__deferred": {
          "uri": "https://sharepoint.com/sites/TestWebseite/_api/Web/FirstUniqueAncestorSecurableObject"
        }
      },

      "...": "...",

      "AllowRssFeeds": true,
      "AlternateCssUrl": "",
      "AppInstanceId": "00000000-0000-0000-0000-000000000000",
      "ClassicWelcomePage": null,
      "Configuration": 0,
      "Created": "2019-09-06T09:07:24.087",
      "CurrentChangeToken": {
        "__metadata": {
          "type": "SP.ChangeToken"
        },
        "StringValue": ""
      },
      "CustomMasterUrl": "/sites/TestWebseite/_catalogs/masterpage/seattle.master",
      "Description": "TestWebseite",
      "DesignPackageId": "00000000-0000-0000-0000-000000000000",
      "DocumentLibraryCalloutOfficeWebAppPreviewersDisabled": false,
      "EnableMinimalDownload": false,
      "FooterEmphasis": 0,
      "FooterEnabled": false,
      "FooterLayout": 0,
      "HeaderEmphasis": 0,
      "HeaderLayout": 0,
      "HorizontalQuickLaunch": false,
      "Id": "f2dd83bb-f3aa-4d2a-9eef-9d85ff9b5cae",
      "IsHomepageModernized": false,
      "IsMultilingual": true,
      "Language": 1033,
      "LastItemModifiedDate": "2019-09-11T09:47:16Z",
      "LastItemUserModifiedDate": "2019-09-06T10:57:26Z",
      "MasterUrl": "/sites/TestWebseite/_catalogs/masterpage/seattle.master",
      "MegaMenuEnabled": false,
      "NoCrawl": false,
      "ObjectCacheEnabled": false,
      "OverwriteTranslationsOnChange": false,
      "ResourcePath": {
        "__metadata": {
          "type": "SP.ResourcePath"
        },
        "DecodedUrl": "https://sharepoint.com/sites/TestWebseite"
      },
      "QuickLaunchEnabled": true,
      "RecycleBinEnabled": true,
      "SearchScope": 0,
      "ServerRelativeUrl": "/sites/TestWebseite",
      "SiteLogoUrl": "",
      "SyndicationEnabled": true,
      "TenantAdminMembersCanShare": 0,
      "Title": "TestWebseite",
      "TreeViewEnabled": false,
      "UIVersion": 15,
      "UIVersionConfigurationEnabled": false,
      "Url": "https://sharepoint.com/sites/TestWebseite",
      "WebTemplate": "GROUP",
      "WelcomePage": "SitePages/Home.aspx"
    }
  }
}
```

## Node: Get Sharepoint List Items

This node returns all items of a specified list. You have to define your `url` such as for the upper node but now you need the SharePoint `list`, too. The node will return all data stored in this specific SharePoint list:

```json
{
  "list": {
    "d": {
      "results": [
        {
          "__metadata": {
            "id": "",
            "uri": "https://sharepoint.com/sites/TestWebseite/_api/Web/Lists(...)",
            "etag": "\"1\"",
            "type": "SP.Data.TestListItem"
          },
          "FileSystemObjectType": 0,
          "Id": 2,
          "ServerRedirectedEmbedUri": null,
          "ServerRedirectedEmbedUrl": "",
          "ID": 2,
          "ContentTypeId": "",
          "Title": "Cognigy",
          "Modified": "2019-09-06T10:10:05Z",
          "Created": "2019-09-06T10:10:05Z",
          "AuthorId": 6,
          "EditorId": 6,
          "OData__UIVersionString": "1.0",
          "Attachments": false,
          "GUID": "",
          "ComplianceAssetId": null
        }
      ]
    }
  }
}
```