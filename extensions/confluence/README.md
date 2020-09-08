
# Atlassian Confluence

Integrates Cognigy.AI with Confluence (https://www.atlassian.com/software/confluence)

Confluence is a popular collaboration tool that allows teams to work together by writing knowledge articles, how-to's and other guides. By using Confluence in conjunction with Cognigy.AI, it becomes possible to create intelligent bots that can search through your Confluence knowledge base and give detailed instructions. This conversational AI can then be released cross-channel. 


**Connection:**

This modules needs a CognigySecret to be defined and passed to the Nodes. A Cognigy Secret can be added to any Cognigy project and allows for the encryption of sensitive data. The secret must have the following keys:

  

- domain (e.g. https://test.atlassian.net)

- username (Your Jira account email address bob@sample.com)

- key (Can be generated within your Jira Project. Click [here](https://confluence.atlassian.com/cloud/api-tokens-938839638.html) for instructions.)

## Node: Search

This function allows Cognigy to search through a specific Confluence workspace based on an input text.  The SearchInput field can be filled with anything ranging from - repeating what the user just said (e.g. {{ci.text}} ) - to specific key phrases.  

**Response JSON Structure**

```json
{
  "confluence": {
    "results": [
      {
        "id": "229450",
        "type": "page",
        "status": "current",
        "title": "Printer does not work",
        "macroRenderedOutput": {
          
        },
        "body": {
          "storage": {
            "value": "<h2>Solution</h2><ac:structured-macro ac:name=\"note\" ac:schema-version=\"1\" ac:macro-id=\"1943ffc0-d5dd-4fc4-8b73-610f6e0b7546\"><ac:rich-text-body><p>PLEASE NOTE: all printers will be replaced by HP DeskJets from August 2019 onwards"
          }
        }
      }
    ]
  }
}
```

 **Please Note** : The response object gives back an array of results. If one or more results have been found, the relevant HTML is also returned. This can be used to render the output in the front-end webchat. 

 
## Node: Get All Pages

Returns all pages within a specific Confluence Space. In order to get the result, one needs to get the **Key** of a space. In most cases, this is a three-character identifier, such as COG or GEN. For example, one can find it in the confluence url of a space: `https://domain.atlassian.net/wiki/spaces/   GEN   /overview` -> space = GEN

**Response JSON Structure**

```json
{
  "confluenceResult": [
    {
        "id": "262277",
        "type": "page",
        "status": "current",
        "title": "IT HELP DESK",
        "webLink": "...",
        "htmlBody": "..."
    }
  ]
} 
```

 **Please Note** : The response object gives back an array of results. If one or more results have been found, the relevant HTML is also returned. This can be used to render the output in the front-end webchat. 