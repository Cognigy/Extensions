# Bitly

This Extension allows the Cognigy.AI Virtual Agent to shorten a URL for further usage. For example, this shorter URL could be used in order to send it via SMS to the user or display it on a chat channel (WhatsApp, Webchat, etc.).

## Connection

- [Access Token](https://app.bitly.com/settings/api/)
- Organization ID
  - This ID can be found in the URL after logging in to bitly.com: https://app.bitly.com/settings/organization/ ... /

## Node: Shorten URL

This Flow Node takes a `URL` and shortens it based on the selected `Group`. As result, the short URL will be stored in the Input or Context object and looks similar to:

```json
{
    "created_at": "2023-02-10T10:15:23+0000",
    "id": "bit.ly/...",
    "link": "https://bit.ly/...",
    "custom_bitlinks": [],
    "long_url": "https://docs.cognigy.com",
    "archived": false,
    "tags": [],
    "deeplinks": [],
    "references": {
        "group": "https://api-ssl.bitly.com/v4/groups/..."
    }
}
```