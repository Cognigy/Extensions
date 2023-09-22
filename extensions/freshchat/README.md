# Freshchat

This Extension can be used in order to handover a conversation to Freshchat.

## Connection

In order to authenticate the virtual agent to establish a connection with Freshchat, the **API KEY** must be provided:

- API Key
  - [How to find your API Key](https://developers.freshchat.com/api/#authentication

  
## Node: Handover to Agent


Response:

```json
{
  "freshchat": {
    "messages": [
      {
        "message_parts": [
          {
            "text": {
              "content": "I would like to talk to an agent"
            }
          }
        ],
        "app_id": "...",
        "actor_id": "...",
        "org_actor_id": "...",
        "id": "...",
        "channel_id": "...",
        "conversation_id": "...",
        "interaction_id": "...",
        "message_type": "normal",
        "actor_type": "user",
        "created_time": "...",
        "user_id": "...",
        "restrictResponse": false,
        "botsPrivateNote": false
      }
    ],
    "conversation_id": "...",
    "app_id": "...",
    "status": "new",
    "channel_id": "...",
    "skill_id": 0,
    "properties": {
      "priority": "Low"
    }
  }
}
```


