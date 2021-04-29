# Calendly

This Extension provides using Calendly within a virtual agent conversation in Cognigy.AI.

## Connection

In order to use this integration, one needs to create a **Private Access Token** inside of the Calendly profile and provide it in Cognigy.AI through a Connection. More information about this required token can be found here: https://developer.calendly.com/getting-started.

### Node: Get User

With this Flow Node the information about a Calendly user can be retrieved. In this case, one can select **Me** (currently logged in user) or **Other ID** (another user by ID) as an option. In both cases, the following information is returned and stored into the Input or Context:


```json
{
  "calendly": {
    "resource": {
      "avatar_url": null,
      "created_at": "2021-04-27T05:55:28.980885Z",
      "current_organization": "https://api.calendly.com/organizations/123123",
      "email": "user@cognigy.com",
      "name": "Alexander Teusz",
      "scheduling_url": "https://calendly.com/myuser",
      "slug": "myuser",
      "timezone": "Europe/Berlin",
      "updated_at": "2021-04-28T11:14:25.087412Z",
      "uri": "https://api.calendly.com/users/123123123"
    }
  }
}
```

### Node: List Events

After using the **Get User** Node, the scheduled events of this user can be retrieved with the **List Events** Flow Node. In order to do so, the *User URI* needs to be provided, while it could be extracted dynamically from the user response with Cognigy Script: `{{input.calendly.resource.uri}}` => "https://api.calendly.com/users/123123123". Therefore, the entire URL needs to be provided and not just the ID of the user. The result, again, is stored in the Input or Context:

```json
{
  "calendly": {
    "collection": [
          {
        "created_at": "2021-04-28T11:14:24.941164Z",
        "end_time": "2021-04-30T08:15:00.000000Z",
        "event_guests": [],
        "event_memberships": [
          {
            "user": "https://api.calendly.com/users/123123"
          }
        ],
        "event_type": "https://api.calendly.com/event_types/12123",
        "invitees_counter": {
          "active": 0,
          "limit": 1,
          "total": 1
        },
        "location": {
          "location": null,
          "type": "custom"
        },
        "name": "15 Minute Meeting",
        "start_time": "2021-04-30T08:00:00.000000Z",
        "status": "canceled",
        "updated_at": "2021-04-28T11:29:02.790610Z",
        "uri": "https://api.calendly.com/scheduled_events/132123"
      },
      {
        "created_at": "2021-04-27T07:53:32.526508Z",
        "end_time": "2021-04-28T10:30:00.000000Z",
        "event_guests": [],
        "event_memberships": [
          {
            "user": "https://api.calendly.com/users/123123"
          }
        ],
        "event_type": "https://api.calendly.com/event_types/123123",
        "invitees_counter": {
          "active": 0,
          "limit": 1,
          "total": 1
        },
        "location": {
          "data": {
            "audioConferencing": {
              "conferenceId": null,
              "dialinUrl": null,
              "tollNumber": null
            }
          },
          "join_url": "https://calendly.com/events/12123/microsoft_teams",
          "status": "pushed",
          "type": "microsoft_teams_conference"
        },
        "name": "My Meeting",
        "start_time": "2021-04-28T10:00:00.000000Z",
        "status": "canceled",
        "updated_at": "2021-04-27T09:17:52.184055Z",
        "uri": "https://api.calendly.com/scheduled_events/123123"
      },
    ],
    "pagination": {
      "count": 1,
      "next_page": null
    }
  }
}
```

### Node: Get Event

If only one specific event should be used in the conversation, the **Get Event** Node can be used. In this case, the *Event ID* needs to be provided, such as "GG4JPQMO6DY6PRPG". The result is stored similar to the above one:

```json
{
  "calendly": {
    "resource": {
      "created_at": "2021-04-27T07:53:32.526508Z",
      "end_time": "2021-04-28T10:30:00.000000Z",
      "event_guests": [],
      "event_memberships": [
        {
          "user": "https://api.calendly.com/users/123123"
        }
      ],
      "event_type": "https://api.calendly.com/event_types/123123",
      "invitees_counter": {
        "active": 0,
        "limit": 1,
        "total": 1
      },
      "location": {
        "data": {
          "audioConferencing": {
            "conferenceId": null,
            "dialinUrl": null,
            "tollNumber": null
          }
        },
        "join_url": "https://calendly.com/events/123123/microsoft_teams",
        "status": "pushed",
        "type": "microsoft_teams_conference"
      },
      "name": "Test Meeting",
      "start_time": "2021-04-28T10:00:00.000000Z",
      "status": "canceled",
      "updated_at": "2021-04-27T09:17:52.184055Z",
      "uri": "https://api.calendly.com/scheduled_events/123123"
    }
  }
}
```

### Node: Get Event Invitees

Last but not least, one can use the **Get Event Invitees** Flow Node in order to get a list of all attendees of a given meeting (event). Similar to the Node above, the *Event ID* (e.g. "GG4JPQMO6DY6PRPG") is required. Furthermore, the result *limit*, *Invitee Email** address and the *Status* of the event can be defined as optional.