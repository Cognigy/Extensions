# Monday.com

With this Extension one can integrate with [Monday.com](https://monday.com/) and get information about boards.

**Connection**

You need to follow [this guide to create your own API V2 Key](https://monday.com/developers/v2#authentication-section).

- key: key
- value: Monday.com API V2 Key

## Node: Get Boards

With this node, one can get information about boards he can view on monday.com:

```json
{
  "monday": {
    "boards": {
      "data": {
        "boards": [
          {
            "name": "Roadmap 2020",
            "id": "722148053",
            "description": "Plan and keep track of all your high-level initiatives and milestones for each quarter. Connect each initiative to its designated items in iteration to track its progress.\nLearn more about this package of templates here: https://www.loom.com/share/cae2390d9aa4400db63a8723b585b97a",
            "items": [
              {
                "name": "New Initiative",
                "column_values": [
                  {
                    "title": "Opportunity/Problem",
                    "id": "text",
                    "type": "text",
                    "text": ""
                  }
                ]
              }
            ]
          }
          {
              "...": "..."
          }
        ]
      }
    }
  }
}
```

## Node: Create Item

This node creates a new item on a specific board using the `board ID`:

```json
{
    "monday": {
        "item": {
            "data": {
                "create_item": {
                    "id": "722413415"
                }
            },
            "account_id": 1111111
        }
    }
}
```