# Microsoft Search

By using the Microsoft Graph API, the virtual agent can access OneDrive and Sharepoint content and search through it based on the user's query.

---

## Node: Search

**Scope:**

- Files.ReadAll
- Sites.ReadAll

If the scope is not provided in the Azure App Registration, the following error will be returned:
`Access to OneDriveFile in Graph API requires the following permissions: Files.Read.All or Sites.Read.All or Files.ReadWrite.All or Sites.ReadWrite.All. However, the application only has the following permissions granted: Chat.ReadWrite, User.Read`

This node searches through Microsoft and returns the found content, such as documents and Sharepoint Sites. The result looks like the following:

```json
{
  "microsoft": {
    "search": [
      {
        "searchTerms": [
          "welcome"
        ],
        "hitsContainers": [
          {
            "hits": [
              {
                "hitId": "tenant.sharepoint.com,...",
                "rank": 1,
                "summary": "<ddd/><c0>Welcome</c0>! Lorem ipsum <ddd/>",
                "resource": {
                  "@odata.type": "#microsoft.graph.site",
                  "displayName": "test",
                  "id": "tenant.sharepoint.com,...",
                  "createdDateTime": "2024-07-29T09:53:55Z",
                  "lastModifiedDateTime": "2024-07-29T09:54:01Z",
                  "name": "welcome",
                  "webUrl": "https://tenant.sharepoint.com/sites/welcome"
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
```

Within the Flow Node, one can configure "Advanced" options, such as the [`Entity Types`](https://learn.microsoft.com/en-us/graph/api/resources/search-api-overview?view=graph-rest-1.0#scope-search-based-on-entity-types) that should be searched through and the `Region`.