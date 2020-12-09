# Zendesk

Integrates Cognigy.AI with the Zendesk Ticketing System (https://www.zendesk.com)

This Extension is based on node-zendesk (https://www.npmjs.com/package/node-zendesk)

**Connection:**

- Zendesk User
  - username
  - token
  - remoteUri

## Node: Create Ticket

- [Zendesk API - Tickets](https://developer.zendesk.com/rest_api/docs/support/tickets)
- [Zendesk API - Create Ticket](https://developer.zendesk.com/rest_api/docs/support/tickets#create-ticket)

The ticket has to be in this format:

```JSON
{ 
    "ticket": {
        "subject":  "My printer is on fire!",
        "description": "It just started smoking after printing my Alexa song",
        "comment":  { "body": "The smoke is very colorful." },
        "priority": "urgent",
        "requester_id": 372568912132
    }
}
```

## Node: Get Ticket

After creating a ticket, the detailed information can be retreived by providing the **Ticket ID**. The result will look such as:

```json
{
  "zendesk": {
    "getTicket": {
      "url": "https://company.zendesk.com/api/v2/tickets/12345.json",
      "id": 12345,
      "external_id": null,
      "via": {
        "channel": "email",
        "source": {
          "from": {
            "address": "a.teusy@cognigy.com",
            "name": "Alexander Teusz"
          },
          "to": {
            "name": "Cognigy",
            "address": "support@cognigy.com"
          },
          "rel": null
        }
      },
      "created_at": "2020-12-08T03:33:23Z",
      "updated_at": "2020-12-08T22:10:16Z",
      "type": null,
      "subject": "My Printer is not working",
      "raw_subject": "My Printer is not working",
      "description": "Hi support, ...",
      "priority": null,
      "status": "open",
      "recipient": "support@cognigy.com",
      "requester_id": 36840,
      "submitter_id": 3684,
      "assignee_id": 111,
      "organization_id": 171,
      "group_id": 1140,
      "collaborator_ids": [
        3704052
      ],
      "follower_ids": [
        3704052
      ],
      "email_cc_ids": [],
      "forum_topic_id": null,
      "problem_id": null,
      "has_incidents": false,
      "is_public": true,
      "due_at": null,
      "tags": [
        "benni",
        "triaged",
        "v4_eap"
      ],
      "custom_fields": [
        {
          "id": 3632,
          "value": null
        }
      ],
      "followup_ids": [],
      "brand_id": 1971,
      "allow_channelback": false,
      "allow_attachments": true
    }
  }
}
```

## Node: Update Ticket

- [Zendesk API - Tickets](https://developer.zendesk.com/rest_api/docs/support/tickets)
- [Zendesk API - Update Ticket](https://developer.zendesk.com/rest_api/docs/support/tickets#update-ticket)

When the ticket needs to be updated based on new information, this node could be used. In order to do so, the **Ticket ID** and **Ticket Data** need to be provided, so that the second one looks like the object in **Create Ticket**:

```json
{ 
    "ticket": {
        "subject":  "My printer is on fire!",
        "description": "It just started smoking after printing my Alexa song",
        "comment":  { "body": "The smoke is very colorful." },
        "priority": "urgent",
        "requester_id": 372568912132
    }
}
```

## Node: Create User

- [Zendesk API - Create User](https://developer.zendesk.com/rest_api/docs/support/users#create-user)

With this node a new user can be added to the Zendeks organisation while the **User Data** object needs to look like:

```json
{
  "user": {
    "name": "Roger Wilco",
    "email": "roge@example.org"
  }
}
```

## Node: Query

- [Zendesk API - Search](https://developer.zendesk.com/rest_api/docs/support/search)

If the required information about a ticket is not known yet, this node can be used in order to find a already created ticket based on a user search query. A response could look like:

```json
{
  "results": [
    {
      "name":        "Ticket Name",
      "created_at":  "2009-05-13T00:07:08Z",
      "updated_at":  "2011-07-22T00:11:12Z",
      "id":          211,
      "result_type": "group"
      "url":         "https://foo.zendesk.com/api/v2/groups/211.json"
    },
    {
      "name":        "Ticket Name",
      "created_at":  "2009-08-26T00:07:08Z",
      "updated_at":  "2010-05-13T00:07:08Z",
      "id":          122,
      "result_type": "group",
      "url":         "https://foo.zendesk.com/api/v2/groups/122.json"
    },
  ],
  "facets":    null,
  "next_page": "https://foo.zendesk.com/api/v2/search.json?query=\"type:Group hello\"&sort_by=created_at&sort_order=desc&page=2",
  "prev_page": null,
  "count":     1234
}
```