# Microsoft Azure DevOps

With this Extension, **work items** can be maintained within an Azure DevOps instance.

## Connection

Please read [this documentation](https://github.com/microsoft/azure-devops-node-api#create-a-connection).

- **token**
  - Personal Access Token
- **organizationUrl**
  - The URL of the Azure DevOps organization
  - e.g. https://dev.azure.com/yourorgname
- **projectId**
  - The name of the DevOps project

### Node: Create Work Item

This Node creates a new work item of `type` BUG, FEATURE, or TASK in an Azure DevOps project. The response contains the newly created item:

```json
{
  "devops": {
    "workItem": {
      "id": 12345,
      "rev": 1,
      "fields": {
        "System.AreaPath": "Project",
        "System.TeamProject": "Project",
        "System.IterationPath": "Project",
        "System.WorkItemType": "Task",
        "System.State": "New",
        "System.Reason": "New",
        "System.AssignedTo": {
          "displayName": "Alexander Teusz",
          "url": "",
          "_links": {
            "avatar": {
              "href": ""
            }
          },
          "id": "78c672e3-d32f-6613-ae78-ac6d50773cc2",
          "uniqueName": "a.teusz@cognigy.com",
          "imageUrl": "",
          "descriptor": ""
        },
        "System.CreatedDate": "2021-06-15T13:31:48.787Z",
        "System.CreatedBy": {
          "displayName": "Alexander Teusz",
          "url": "",
          "_links": {
            "avatar": {
              "href": ""
            }
          },
          "id": "78c672e3-d32f-6613-ae78-ac6d50773cc2",
          "uniqueName": "a.teusz@cognigy.com",
          "imageUrl": "",
          "descriptor": ""
        },
        "System.ChangedDate": "2021-06-15T13:31:48.787Z",
        "System.ChangedBy": {
          "displayName": "Alexander Teusz",
          "url": "",
          "_links": {
            "avatar": {
              "href": ""
            }
          },
          "id": "78c672e3-d32f-6613-ae78-ac6d50773cc2",
          "uniqueName": "a.teusz@cognigy.com",
          "imageUrl": "",
          "descriptor": ""
        },
        "System.CommentCount": 0,
        "System.Title": "Test Work Item",
        "Microsoft.VSTS.Common.StateChangeDate": "2021-06-15T13:31:48.787Z",
        "Microsoft.VSTS.Common.Priority": 2
      },
      "_links": {
        "self": {
          "href": ""
        },
        "workItemUpdates": {
          "href": ""
        },
        "workItemRevisions": {
          "href": ""
        },
        "workItemComments": {
          "href": ""
        },
        "html": {
          "href": ""
        },
        "workItemType": {
          "href": ""
        },
        "fields": {
          "href": ""
        }
      },
      "url": ""
    }
}
```

### Node: Get Work Item

This Flow Node takes a work item ID (`workItemId`) and returns the same JSON object as above.