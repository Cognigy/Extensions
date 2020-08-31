# Atlassian Jira Custom Module

Integrates Cognigy.AI with Jira (https://www.atlassian.com/software/jira) 

This module is based on the Jira Connector (https://github.com/floralvikings/jira-connector)

**Connection:**

- domain (e.g. my-domain.atlassian.net)
- username (Your Jira account email address bob@sample.com)
- password (Can be generated within your Jira Project. Click [here](https://confluence.atlassian.com/cloud/api-tokens-938839638.html) for instructions.)

**PLEASE NOTE:** 
*This package uses the term **"ticket"** as a generic term for any Jira issue. This can be  a UserStory, Issue, etc.*


 ## Node: Extract Ticket

This function can be used to dynamically extract tickets from any given text, which can then be used with e.g. the **getTicket function** (see below).

Some examples of tickets that will be recognized out of the box: 

| Example Ticket Formats|
| ----------------------|
| SB-1234               |
| ITEF-01               |
| USTORY-91234          |

This means that if the {{ci.text}} input text is something like this:

"What is the status of ticket **ITI-1542?**"

the extractTicket node will automatically extract **ITI-1542** and write it to the Cognigy Context for further use. 


## Node: Get Ticket

This is a convenience function that returns a quick summary of a given ticket. 

**Response JSON Structure:**

```json
{
  "jira": {
    "ticket": {
      "expand": "",
      "id": "10000",
      "self": "",
      "key": "COG-1",
      "fields": {
        "statuscategorychangedate": "",
        "issuetype": {
          "self": "",
          "id": "10002",
          "description": "",
          "iconUrl": "",
          "name": "Task",
          "subtask": false,
          "avatarId": 10318
        },
        "timespent": null,
        "project": {
          "self": "",
          "id": "10000",
          "key": "COG",
          "name": "Cognigy",
          "projectTypeKey": "software",
          "simplified": false,
          "avatarUrls": {
            "48x48": "",
            "24x24": "",
            "16x16": "",
            "32x32": ""
          }
        },
       "...": "..."
}
```

## Node: Create Ticket

Use this node to create a new ticket: https://developer.atlassian.com/server/jira/platform/jira-rest-api-example-create-issue-7897248/


**Response JSON Structure:**

```json
"summary": {
    "ticket": "CI-10",
    "type": "Epic",
    "project": "Customer Issues",
    "status": "To Do",
    "assignedTo": "a.teusz@cognigy.com",
    "reportedBy": "t.waanders@cognigy.com",
    "resolution": null,
    "comments": []
  }
```
