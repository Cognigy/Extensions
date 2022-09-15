# Asana

This Extension can be used in order to retrieve projects, users, their tasks or details of a specific task.

## Connection

"Similarly to entering your username/password into a website or logging into Asana with Google, when you access your Asana data via the API you need to authenticate. In the above example, you were already logged into Asana in your browser so you were able to authenticate to the API with credentials stored by your browser. If you want to write a script that interacts with the Asana API, the easiest method is to get a Personal Access Token (PAT), which you can think of as your unique password for accessing the API. ([Asana, 2022](https://developers.asana.com/docs/authentication-quick-start))". Please follow the official documentation to create a Personal Access Token: https://developers.asana.com/docs/authentication-quick-start 

- personalAccessToken

## Node: Get Projects

This Flow Node retrieves all projects from Asana. Optionally, one can define the workspace. The result will be stored in the Input or Context object and looks similar to:

```json
{
  "asana": {
    "projects": [
      {
        "gid": "123456789",
        "name": "General",
        "resource_type": "project"
      }
    ]
  }
}
```

## Node: Get Users

This Flow Node retrieves all users from a defined workspace. The result will be stored in the Input or Context object and looks similar to:

```json
{
  "asana": {
    "users": [
      {
        "gid": "123456789",
        "name": "Max Mustermann",
        "resource_type": "user"
      },
      {
        "gid": "789456123",
        "name": "Laura Wilson",
        "resource_type": "user"
      }
    ]
  }
}
```

## Node: Get User Tasks

This Flow Node retrieves all tasks of a specified user in a given workspace. The result will be stored in the Input or Context object and looks similar to:

```json
{
  "asana": {
    "tasks": [
      {
        "gid": "123123123123",
        "name": "Geschenke zur Vertragsverlängerung senden",
        "resource_type": "task",
        "resource_subtype": "default_task"
      },
      {
        "gid": "345345345345",
        "name": "VIP-Abendessen ansetzen",
        "resource_type": "task",
        "resource_subtype": "default_task"
      },
      {
        "gid": "567567567567",
        "name": "Mit Webinarleiter abstimmen",
        "resource_type": "task",
        "resource_subtype": "default_task"
      }
    ]
  }
}
```

<b><u>Dynamically display the tasks to the user</u></b>

One can use a [Code Node](https://docs.cognigy.com/ai/flow-nodes/code/code/) in Cognigy.AI to dynamically display the results or the Asana tasks -- for example. Therefore, the following documentation can be followed: https://docs.cognigy.com/ai/flow-nodes/code/ai-default-channel-formats/#text-with-quick-replies. As an example, a Gallery message could show all open tasks of the user:

```ts
let galleryItems: any[] = [];

for (let task of context.asana.tasks) {
    galleryItems.push({
        "title": task.name,
        "subtitle": "",
        "imageUrl": "",
        "buttons": [
            {
                "payload": task.gid,
                "type": "postback",
                "title": "View Details"
            }
        ]
    })
}

api.say("", {
    "type": "gallery",
    "_cognigy": {
        "_default": {
            "_gallery": {
                "type": "carousel",
                "items": galleryItems,
                "fallbackText": ""
            }
        }
    }
});
```

# Node: Get Task Details

If the general task information, that is returned by the "Get User Taks" Flow Node, is not enough, this Flow Node can be used. It retrieves all details of a task while the task ID must be provided. The result will be stored in the Input or Context object and looks similar to:


```json
{
    "task": {
      "gid": "123123",
      "assignee": {
        "gid": "12123",
        "name": "Alex",
        "resource_type": "user"
      },
      "assignee_status": "inbox",
      "assignee_section": {
        "gid": "123123",
        "name": "Recently assigned",
        "resource_type": "section"
      },
      "completed": false,
      "completed_at": null,
      "created_at": "2022-07-25T11:48:04.782Z",
      "custom_fields": [
        {
          "gid": "123123",
          "enabled": true,
          "enum_options": [
            {
              "gid": "123123",
              "color": "aqua",
              "enabled": true,
              "name": "Niedrig",
              "resource_type": "enum_option"
            },
            {
              "gid": "1123",
              "color": "yellow-orange",
              "enabled": true,
              "name": "Mittel",
              "resource_type": "enum_option"
            },
            {
              "gid": "123123",
              "color": "purple",
              "enabled": true,
              "name": "Hoch",
              "resource_type": "enum_option"
            }
          ],
          "enum_value": {
            "gid": "12123",
            "color": "aqua",
            "enabled": true,
            "name": "Niedrig",
            "resource_type": "enum_option"
          },
          "name": "Priorität",
          "description": "Geben Sie die Priorität einer Aufgabe an.",
          "created_by": {
            "gid": "123123",
            "name": "Alex",
            "resource_type": "user"
          },
          "display_value": "Niedrig",
          "resource_subtype": "enum",
          "resource_type": "custom_field",
          "type": "enum"
        },
        {
          "gid": "123123",
          "enabled": true,
          "enum_options": [
            {
              "gid": "123123",
              "color": "blue-green",
              "enabled": true,
              "name": "Planmäßig",
              "resource_type": "enum_option"
            },
            {
              "gid": "12123",
              "color": "yellow",
              "enabled": true,
              "name": "Gefährdet",
              "resource_type": "enum_option"
            },
            {
              "gid": "132123",
              "color": "red",
              "enabled": true,
              "name": "Unplanmäßig",
              "resource_type": "enum_option"
            }
          ],
          "enum_value": {
            "gid": "123123",
            "color": "blue-green",
            "enabled": true,
            "name": "Planmäßig",
            "resource_type": "enum_option"
          },
          "name": "Status",
          "description": "Verfolgen Sie den Status jeder einzelnen Aufgabe.",
          "created_by": {
            "gid": "123123",
            "name": "Alex",
            "resource_type": "user"
          },
          "display_value": "Planmäßig",
          "resource_subtype": "enum",
          "resource_type": "custom_field",
          "type": "enum"
        }
      ],
      "due_at": null,
      "due_on": "2022-07-27",
      "followers": [
        {
          "gid": "123123",
          "name": "Alex",
          "resource_type": "user"
        }
      ],
      "hearted": false,
      "hearts": [],
      "liked": false,
      "likes": [],
      "memberships": [
        {
          "project": {
            "gid": "123123",
            "name": "General",
            "resource_type": "project"
          },
          "section": {
            "gid": "123123",
            "name": "To-do",
            "resource_type": "section"
          }
        }
      ],
      "modified_at": "2022-07-26T22:33:37.248Z",
      "name": "Geschenke zur Vertragsverlängerung senden",
      "notes": "",
      "num_hearts": 0,
      "num_likes": 0,
      "parent": null,
      "permalink_url": "https://app.asana.com/0/123123/123123",
      "projects": [
        {
          "gid": "123123",
          "name": "General",
          "resource_type": "project"
        }
      ],
      "resource_type": "task",
      "start_at": null,
      "start_on": "2022-07-25",
      "tags": [],
      "resource_subtype": "default_task",
      "workspace": {
        "gid": "123123",
        "name": "Test",
        "resource_type": "workspace"
      }
    }
}
```