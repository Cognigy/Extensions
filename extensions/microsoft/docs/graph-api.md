# Use the Graph API

After storing the Access Token (`access_token`) into the Cognigy Context, the AI is ready to call Graph API functions by adding the specific nodes to a Flow.

- Access the token via Cognigy Script:  `{{context.microsoft.auth.access_token}}`

---

## Node: Get User Details

This node gets the details of the Microsoft user in the Active Directory. The result looks like the following:

```json
{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users/$entity",
    "businessPhones": [],
    "displayName": "Alexander Teusz",
    "givenName": "Alexander",
    "jobTitle": null,
    "mail": "a.teusz@cognigy.com",
    "mobilePhone": null,
    "officeLocation": null,
    "preferredLanguage": "de-DE",
    "surname": "Teusz",
    "userPrincipalName": "a.teusz@cognigy.com",
    "id": "..."
}
```

With this information, the virtual agent can greet the user. An example Say Node configuration could be the following:

- "Hello `{{context.microsoft.user.displayName}}`. How are you today."
- "You are logged in with the email address `{{context.microsoft.user.mail}}`"

## Node: Outlook Calendar - Schedule Meeting

With this Flow node, the virtual agent can automatically schedule a meeting in the user's **Outlook Calendar** and invite others to this event.

## Node: Microsoft Teams - Send Channel Message

This Flow nodes sends an HTML message to a specific Microsoft Teams channel (`channelId` ([Read More](https://docs.microsoft.com/en-us/graph/api/user-list-joinedteams?view=graph-rest-1.0&tabs=http))) in a team (`teamId` ([Read More](https://docs.microsoft.com/en-us/graph/api/channel-list?view=graph-rest-1.0&tabs=http))). In order to do so, one needs to add the following permission scope in the authentication nodes:

1. ChannelMessage.Send
