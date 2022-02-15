# Alfresco Repository
This Extension provides various **Alfresco Content Services** functions in order to get information from the Alfresco Content repo.

- [API Documentation](https://docs.alfresco.com/content-services/latest/develop/rest-api-guide/)
- [API Swager and test](https://api-explorer.alfresco.com/api-explorer/)

## Connections

In order to use the whole Extension, one Connection needs to be defined.

**Authentication:**

- username (The Alfresco User ID)
- password
- url
  - The Alfresco authentication url
  - e.g. http(s)://{YourDomainName.com}

**Instance:**

After successfully authenticating the system user, the actual **Alfresco** instance needs to be defined as it will be used by all other Flow Nodes in this Extension.

- instanceUri
  - *Please make sure to remove the last "/" from the url*


**Please store the result into the [Cognigy Context](https://docs.cognigy.com/docs/context) in order to make it accessible during the whole conversation.**

### Node: Get User Activity

Retrieves all user activity for the selected user -- based on the provided access token.

```Fields
  "UserID"      The User you would like to audit
  "skipCount"   The start number of audit id.  If the total results are over 100, you can request the additional results. 
  "no_results"  The total number of results you would like to receive
  "siteId"      The site id to search for. ex "Sales-marketing” no spaces
```

### Node: Get Activity

After running an audit, the conversation can check if the results are already available and continue based on this information.

```json
{
  "alfresco": {
    "UserActivity": {
      "list": {
        "pagination": {
          "count": 26,
          "hasMoreItems": false,
          "skipCount": 0,
          "maxItems": 100
        },
        "entries": [
          {
            "entry": {
              "postedAt": "2022-01-18T21:12:18.998+0000",
              "feedPersonId": "demo",
              "postPersonId": "demo",
              "siteId": "rpa-solution",
              "activitySummary": {
                "firstName": "Demo",
                "lastName": "User",
                "parentObjectId": "...",
                "title": "BBIL monthly service fees 4-2010 invoice 122.pdf",
                "objectId": "..."
              },
              "id": 1190,
              "activityType": "org.alfresco.documentlibrary.file-updated"
            },
          }],
      },
    },
  },
}
```

### Node: Get Content Search

Search for content that matches the search term.

```Fields
  "SearchTerm"  The Term you would like to search for.  Ex: a keyword or term that was indexed or content name.  Just like the search bar functionality. 
  "skipCount"   The start number of audit id.  If the total results are over 100, you can request the additional results.
  "no_results"  The total number of results you would like to receive
  "rootNodeID"  The NODE ID of a folder, parent NODE etc..
  "Orderby"     A string to control the order of the entities returned in a list. You can use the orderBy parameter to sort the list by one or more fields.
	"fields"     You can use this parameter to restrict the fields returned within a response if, for example, you want to save on overall bandwidth. 
	"Include"    Returns additional information about the node. The following optional fields can be requested: allowableOperations,aspectNames,isLink,isFavorite,isLocked,path,properties

  NOTE: for fields and Include, make sure you do not put spaces between the field names.  Simply use the comma only
```

### Node:  Get Searched Content

After running the search, the conversation can check if the results are already available and continue based on this information.

```json
{
   "alfresco": {
    "ContentSearch": {
      "list": {
        "pagination": {
          "count": 26,
          "hasMoreItems": false,
          "totalItems": 26,
          "skipCount": 0,
          "maxItems": 100
        },
        "entries": [
          {
            "entry": {
              "createdAt": "2021-10-13T16:39:30.581+0000",
              "isFolder": false,
              "isFile": true,
              "createdByUser": {
                "id": "demo",
                "displayName": "Demo User"
              },
              "modifiedAt": "2022-02-04T15:56:12.822+0000",
              "modifiedByUser": {
                "id": "demo",
                "displayName": "Demo User"
              },
              "name": "Shore monthly service fees 6-2013 invoice 579.pdf",
              "id": "319c0f0c-67b2-4a01-a5da-978f412531ba",
              "nodeType": "cm:content",
              "content": {
                "mimeType": "application/pdf",
                "mimeTypeName": "Adobe PDF Document",
                "sizeInBytes": 30493,
                "encoding": "UTF-8"
              },
              "parentId": "af7827f2-5cce-4450-82ed-f0ba25902a88"
            }
          },]
      }
    }
   }
}
```

### Node: Set Content to be shareable 

Set a specific content to be shareable for external user to view the content.

```Fields
  "ContentNodeID"      The NodeID of the content to be shared
```

### Node: Set Content

After setting the content to be shared, you will receive a response with the  shareable deep link. the "filelink" is your endpoint to view the content. 
NOTE: this feature is only available if you have purchased the external user license from alfresco.

```json
{
  "alfresco": {
    "SharedContent": {
      "entry": {
        "isFile": true,
        "createdByUser": {
          "id": "demo",
          "displayName": "Demo User"
        },
        "modifiedAt": "2022-02-04T15:56:12.822+0000",
        "nodeType": "cm:content",
        "content": {
          "mimeType": "application/pdf",
          "mimeTypeName": "Adobe PDF Document",
          "sizeInBytes": 30493,
          "encoding": "UTF-8"
        },
        "parentId": "...",
        "aspectNames": [
          "qshare:shared",
          "cm:auditable"
        ],
        "createdAt": "2021-10-13T16:39:30.581+0000",
        "isFolder": false,
        "modifiedByUser": {
          "id": "demo",
          "displayName": "Demo User"
        },
        "name": "Shore monthly service fees 6-2013 invoice 579.pdf",
        "id": "...",
        "properties": {
          "qshare:sharedBy": "demo",
          "qshare:sharedId": "..."
        }
      }
    }
  },
  "filelinkraw": "...",
  "filelink": "https://{YourDomainName}/share/s/...-..."
}
```

### Node: Update content in repository

Update the content info.

```Fields
  "ContentNodeID"   The content NodeID to be Updated.
  "nodeBodyUpdate"  The node information to update.  This is a Json object

  "fields"          You can use this parameter to restrict the fields returned within a response if, for example, you want to save on overall bandwidth. 
	"Include"         Returns additional information about the node. The following optional fields can be requested: allowableOperations,aspectNames,isLink,isFavorite,isLocked,path,properties

  NOTE: for fields and Include, make sure you do not put spaces between the field names.  Simply use the comma only
```

### Node: update Content

After running the update, the conversation can check if the results are already available and continue based on this information.

```json
{
  "alfresco": {
    "UpdateContent": {
      "entry": {
        "isFile": true,
        "createdByUser": {
          "id": "demo",
          "displayName": "Demo User"
        },
        "modifiedAt": "2022-02-08T16:49:02.771+0000",
        "nodeType": "cm:content",
        "content": {
          "mimeType": "application/pdf",
          "mimeTypeName": "Adobe PDF Document",
          "sizeInBytes": 30493,
          "encoding": "UTF-8"
        },
        "parentId": "...",
        "aspectNames": [
          "qshare:shared",
          "cm:auditable"
        ],
        "createdAt": "2021-10-13T16:39:30.581+0000",
        "isFolder": false,
        "modifiedByUser": {
          "id": "demo",
          "displayName": "Demo User"
        },
        "name": "My new name",
        "id": "...",
        "properties": {
          "qshare:sharedBy": "demo",
          "qshare:sharedId": "..."
        }
      }
    },
   }
}
```

### Node: Create a Folder in repository
Create a folder in the repository

```Fields
  "ParentNodeID"    The Parent NodeID to place teh folder into.  This can be a site or a folder.
  "FolderName"      The name of the folder you would like to create.
  "FolderTitle"     The title of the folder you would like to create.  
  "description"     The description of the folder you would like to create.
  "fields"          You can use this parameter to restrict the fields returned within a response if, for example, you want to save on overall bandwidth. 
	"Include"         Returns additional information about the node. The following optional fields can be requested: allowableOperations,aspectNames,isLink,isFavorite,isLocked,path,properties

  NOTE: for fields and Include, make sure you do not put spaces between the field names.  Simply use the comma only
```

### Node: update Content

After running the creation of teh folder, the conversation can check if the results are already available and continue based on this information.

```json
{
  "alfresco": {
    "CreateFolder": {
      "entry": {
        "aspectNames": [
          "cm:titled",
          "cm:auditable"
        ],
        "createdAt": "2022-02-09T15:48:57.044+0000",
        "isFolder": true,
        "isFile": false,
        "createdByUser": {
          "id": "demo",
          "displayName": "Demo User"
        },
        "modifiedAt": "2022-02-09T15:48:57.044+0000",
        "modifiedByUser": {
          "id": "demo",
          "displayName": "Demo User"
        },
        "name": "Test",
        "id": "...",
        "nodeType": "cm:folder",
        "properties": {
          "cm:title": "test",
          "cm:description": "This is the API creating"
        },
        "parentId": "..."
      }
    }
  }
}
```



